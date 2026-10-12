import request from 'supertest';
import { app } from '../server/src/app.js';
import { prisma } from '../server/src/db/prisma.js';
import { runSeed } from '../server/src/db/seed.js';

let adminToken = '';
let testCategoryId = '';
let testProductId = '';

console.log('====================================================');
console.log('    PHASE 3 PRODUCTION BACKEND TEST SUITE           ');
console.log('====================================================\n');

async function setup() {
  await runSeed();
  // Get an existing category
  const category = await prisma.category.findFirst({ where: { enabled: true } });
  if (category) testCategoryId = category.id;
}

let passCount = 0;
let failCount = 0;

function assert(condition: boolean, testName: string, message = '') {
  if (condition) {
    console.log(`  [PASS] ${testName}`);
    passCount++;
  } else {
    console.error(`  [FAIL] ${testName}: ${message}`);
    failCount++;
  }
}

async function runTests() {
  await setup();

  // ----------------------------------------------------
  // 1. PUBLIC ENDPOINTS & HEALTH
  // ----------------------------------------------------
  console.log('\n--- 1. Public Endpoints & Health ---');
  {
    const res = await request(app).get('/api/health');
    assert(res.status === 200 && res.body.status === 'healthy', 'GET /api/health returns 200 healthy');
  }

  {
    const res = await request(app).get('/api/categories');
    assert(res.status === 200 && Array.isArray(res.body.categories) && res.body.categories.length > 0, 'GET /api/categories returns enabled categories');
  }

  {
    const res = await request(app).get('/api/products');
    assert(res.status === 200 && Array.isArray(res.body.products) && res.body.total > 0, 'GET /api/products returns published products with pagination');
  }

  {
    const res = await request(app).get('/api/products/sony-wh-1000xm5-noise-canceling');
    assert(res.status === 200 && res.body.product.name.includes('Sony'), 'GET /api/products/:slug returns published product');
  }

  {
    const res = await request(app).get('/api/products/non-existent-specimen-slug');
    assert(res.status === 404, 'GET /api/products/:slug returns 404 for non-existent product');
  }

  {
    const res = await request(app).get('/api/categories/audio/products');
    assert(res.status === 200 && Array.isArray(res.body.products), 'GET /api/categories/:slug/products returns category catalog');
  }

  // ----------------------------------------------------
  // 2. ADMIN AUTHENTICATION & SECURITY
  // ----------------------------------------------------
  console.log('\n--- 2. Admin Authentication & Protection ---');
  {
    const res = await request(app).get('/api/admin/dashboard');
    assert(res.status === 401, 'Unauthorized request to /api/admin/dashboard rejected with 401');
  }

  {
    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: 'admin@curatedstudio.internal', password: 'WrongPassword123' });
    assert(res.status === 401, 'Login with incorrect password rejected with 401');
  }

  {
    const res = await request(app)
      .post('/api/admin/auth/login')
      .send({ email: 'admin@curatedstudio.internal', password: 'CuratorAdmin2026!' });
    assert(res.status === 200 && Boolean(res.body.token), 'Login with valid credentials returns 200 and token');
    adminToken = res.body.token;
  }

  {
    const res = await request(app)
      .get('/api/admin/auth/me')
      .set('Authorization', `Bearer ${adminToken}`);
    assert(res.status === 200 && res.body.user.email === 'admin@curatedstudio.internal', 'GET /api/admin/auth/me validates session and returns user info');
  }

  {
    const res = await request(app).post('/api/admin/auth/logout');
    assert(res.status === 200, 'POST /api/admin/auth/logout clears session');
  }

  // ----------------------------------------------------
  // 3. PRODUCT CRUD & VALIDATION
  // ----------------------------------------------------
  console.log('\n--- 3. Product CRUD & Schema Validation ---');
  {
    // Invalid submission
    const res = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: '' });
    assert(res.status === 400 && res.body.success === false, 'POST /api/admin/products rejects incomplete payload with 400');
  }

  {
    // Valid creation
    const res = await request(app)
      .post('/api/admin/products')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: 'Bang & Olufsen Beosound A1 2nd Gen',
        categoryId: testCategoryId,
        imageUrl: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800',
        displayPrice: '₹24,990',
        priceAmount: 24990,
        amazonUrl: 'https://www.amazon.in/dp/B085758W8H',
        flipkartUrl: 'https://www.flipkart.com/bo-beosound-a1/p/itm123',
        status: 'draft',
      });
    assert(res.status === 201 && res.body.product.id, 'POST /api/admin/products creates product with 201');
    testProductId = res.body.product.id;
  }

  {
    // Read single
    const res = await request(app)
      .get(`/api/admin/products/${testProductId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    assert(res.status === 200 && res.body.product.name.includes('Bang & Olufsen'), 'GET /api/admin/products/:id retrieves created product');
  }

  {
    // Update
    const res = await request(app)
      .patch(`/api/admin/products/${testProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ displayPrice: '₹22,990', priceAmount: 22990 });
    assert(res.status === 200 && res.body.product.displayPrice === '₹22,990', 'PATCH /api/admin/products/:id updates price and details');
  }

  // ----------------------------------------------------
  // 4. PUBLICATION WORKFLOW & VISIBILITY QUARANTINE
  // ----------------------------------------------------
  console.log('\n--- 4. Publication Workflow & Visibility Quarantine ---');
  {
    // Our created product is currently 'draft'
    const publicList = await request(app).get('/api/products');
    const isVisibleInPublic = publicList.body.products.some((p: any) => p.id === testProductId);
    assert(!isVisibleInPublic, 'Draft product is quarantined: does NOT appear in public GET /api/products');
  }

  {
    // Publish product
    const res = await request(app)
      .patch(`/api/admin/products/${testProductId}/publish`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'published' });
    assert(res.status === 200 && res.body.product.status === 'published', 'PATCH /api/admin/products/:id/publish updates status to published');

    // Verify it now appears in public feed
    const publicList = await request(app).get('/api/products');
    const isNowVisible = publicList.body.products.some((p: any) => p.id === testProductId);
    assert(isNowVisible, 'Published product now appears in public catalog');
  }

  // ----------------------------------------------------
  // 5. CATEGORY CRUD & RESTRICTIONS
  // ----------------------------------------------------
  console.log('\n--- 5. Category Management & Safety Restrictions ---');
  let newCatId = '';
  {
    // Create Category
    const res = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Workstation Acoustics', slug: 'workstation-acoustics', order: 10 });
    assert(res.status === 201 && res.body.category.id, 'POST /api/admin/categories creates category');
    newCatId = res.body.category.id;
  }

  {
    // Duplicate slug collision
    const res = await request(app)
      .post('/api/admin/categories')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Workstation Acoustics Duplicate', slug: 'workstation-acoustics' });
    assert(res.status === 409, 'Duplicate category slug rejected with 409 Conflict');
  }

  {
    // Update category
    const res = await request(app)
      .patch(`/api/admin/categories/${newCatId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ name: 'Studio Acoustics' });
    assert(res.status === 200 && res.body.category.name === 'Studio Acoustics', 'PATCH /api/admin/categories/:id updates category');
  }

  {
    // Move our test product into this category
    await request(app)
      .patch(`/api/admin/products/${testProductId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ categoryId: newCatId });

    // Attempt to delete category containing products without reassignment
    const res = await request(app)
      .delete(`/api/admin/categories/${newCatId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    assert(res.status === 400, 'Attempting to delete populated category without reassignment returns 400 error');
  }

  {
    // Delete with reassignment to testCategoryId
    const res = await request(app)
      .delete(`/api/admin/categories/${newCatId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ reassignToCategoryId: testCategoryId });
    assert(res.status === 200 && res.body.success === true, 'DELETE /api/admin/categories/:id with reassignment safely migrates products and deletes category');
  }

  // ----------------------------------------------------
  // 6. AFFILIATE REDIRECTS & CLICK TRACKING
  // ----------------------------------------------------
  console.log('\n--- 6. Affiliate Redirects & Click Tracking ---');
  {
    // Valid Amazon redirect
    const res = await request(app).get(`/api/go/${testProductId}/amazon`);
    assert(res.status === 302 && res.headers.location?.includes('amazon.in'), 'GET /api/go/:id/amazon issues 302 redirect to verified Amazon host');
  }

  {
    // Valid Flipkart redirect
    const res = await request(app).get(`/api/go/${testProductId}/flipkart`);
    assert(res.status === 302 && res.headers.location?.includes('flipkart.com'), 'GET /api/go/:id/flipkart issues 302 redirect to verified Flipkart host');
  }

  {
    // Invalid platform
    const res = await request(app).get(`/api/go/${testProductId}/aliexpress`);
    assert(res.status === 400, 'GET /api/go/:id/:platform rejects unapproved platform with 400');
  }

  {
    // Verify Click Analytics in Admin
    const res = await request(app)
      .get('/api/admin/affiliate-clicks')
      .set('Authorization', `Bearer ${adminToken}`);
    assert(res.status === 200 && res.body.totalClicks >= 2, 'GET /api/admin/affiliate-clicks records and aggregates clicks without visitor PII');
  }

  // ----------------------------------------------------
  // 7. PRODUCT IMAGE STORAGE VALIDATION
  // ----------------------------------------------------
  console.log('\n--- 7. Image Storage Validation ---');
  {
    // 1x1 transparent PNG in base64
    const validPngBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const res = await request(app)
      .post('/api/admin/upload-image')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ base64Data: validPngBase64, filename: 'specimen-test.png' });
    assert(res.status === 201 && res.body.url.includes('/uploads/'), 'POST /api/admin/upload-image validates and stores image securely with 201');
  }

  {
    // Invalid MIME type (text/plain)
    const invalidBase64 = 'data:text/plain;base64,SGVsbG8gd29ybGQ=';
    const res = await request(app)
      .post('/api/admin/upload-image')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ base64Data: invalidBase64, filename: 'test.txt' });
    assert(res.status === 400, 'POST /api/admin/upload-image rejects non-image MIME types with 400');
  }

  // ----------------------------------------------------
  // 8. CLEANUP PRODUCT DELETE
  // ----------------------------------------------------
  console.log('\n--- 8. Cleanup & Product Delete ---');
  {
    const res = await request(app)
      .delete(`/api/admin/products/${testProductId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    assert(res.status === 200 && res.body.success === true, 'DELETE /api/admin/products/:id deletes product successfully');
  }

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log(` TEST RESULTS: ${passCount} PASSED, ${failCount} FAILED `);
  console.log('====================================================');

  await prisma.$disconnect();

  if (failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(async (e) => {
  console.error('Fatal test error:', e);
  await prisma.$disconnect();
  process.exit(1);
});


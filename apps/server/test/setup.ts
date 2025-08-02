// Test setup file for environment configuration
process.env.NODE_ENV = 'test';
process.env.INTASEND_PUBLISHABLE_KEY = 'test_pub_key';
process.env.INTASEND_SECRET_KEY = 'test_secret_key';
process.env.INTASEND_WEBHOOK_SECRET = 'test_webhook_secret';
process.env.INTASEND_TEST_MODE = 'true';
process.env.DATABASE_URL = 'mongodb://localhost:27017/seoanalyzer_test';

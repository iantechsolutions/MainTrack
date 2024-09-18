class Constants {
  static const String BASE_URL = 'https://compet-tracc.vercel.app/api/app/v1';
  static const String BASE_TEST_URL = 'http://localhost:3000/api/app/v1';
  static const bool TEST_MODE = true;

  static String getBaseUrl() {
    if (TEST_MODE) {
      return BASE_TEST_URL;
    } else {
      return BASE_URL;
    }
  }
}

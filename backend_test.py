import requests
import sys
import json
import base64
from datetime import datetime

class MemoryVaultAPITester:
    def __init__(self, base_url="https://memory-vault-71.preview.emergentagent.com"):
        self.base_url = base_url
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        if headers:
            test_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=test_headers, timeout=10)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json() if response.text else {}
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}")
                self.failed_tests.append({
                    'test': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:200]
                })
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'test': name,
                'error': str(e)
            })
            return False, {}

    def test_login_valid(self):
        """Test login with valid password"""
        success, response = self.run_test(
            "Login with valid password",
            "POST",
            "auth/login",
            200,
            data={"password": "vampire2024"}
        )
        if success and 'token' in response:
            self.token = response['token']
            print(f"   Token received: {self.token}")
            print(f"   Theme: {response.get('theme', 'not provided')}")
            return True
        return False

    def test_login_invalid(self):
        """Test login with invalid password"""
        success, _ = self.run_test(
            "Login with invalid password",
            "POST",
            "auth/login",
            401,
            data={"password": "wrongpassword"}
        )
        return success

    def test_verify_token(self):
        """Test token verification"""
        if not self.token:
            print("❌ No token available for verification")
            return False
        
        success, _ = self.run_test(
            "Verify token",
            "GET",
            f"auth/verify?token={self.token}",
            200
        )
        return success

    def test_gallery_operations(self):
        """Test gallery CRUD operations"""
        # Test get empty gallery
        success, gallery = self.run_test(
            "Get gallery (empty)",
            "GET",
            "gallery",
            200
        )
        if not success:
            return False

        # Create sample image data
        sample_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        
        # Test create gallery image
        success, created_image = self.run_test(
            "Create gallery image",
            "POST",
            "gallery",
            200,
            data={"image_data": sample_image, "caption": "Test image"}
        )
        if not success:
            return False

        image_id = created_image.get('id')
        if not image_id:
            print("❌ No image ID returned")
            return False

        # Test get gallery with image
        success, gallery = self.run_test(
            "Get gallery (with image)",
            "GET",
            "gallery",
            200
        )
        if not success:
            return False

        # Test delete gallery image
        success, _ = self.run_test(
            "Delete gallery image",
            "DELETE",
            f"gallery/{image_id}",
            200
        )
        return success

    def test_achievements_operations(self):
        """Test achievements CRUD operations"""
        # Test get empty achievements
        success, achievements = self.run_test(
            "Get achievements (empty)",
            "GET",
            "achievements",
            200
        )
        if not success:
            return False

        # Test create achievement
        sample_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        success, created_achievement = self.run_test(
            "Create achievement",
            "POST",
            "achievements",
            200,
            data={
                "title": "Test Achievement",
                "description": "This is a test achievement",
                "date": "2024-01-01",
                "image_data": sample_image
            }
        )
        if not success:
            return False

        achievement_id = created_achievement.get('id')
        if not achievement_id:
            print("❌ No achievement ID returned")
            return False

        # Test get achievements with data
        success, achievements = self.run_test(
            "Get achievements (with data)",
            "GET",
            "achievements",
            200
        )
        if not success:
            return False

        # Test delete achievement
        success, _ = self.run_test(
            "Delete achievement",
            "DELETE",
            f"achievements/{achievement_id}",
            200
        )
        return success

    def test_todos_operations(self):
        """Test todos CRUD operations"""
        # Test get empty todos
        success, todos = self.run_test(
            "Get todos (empty)",
            "GET",
            "todos",
            200
        )
        if not success:
            return False

        # Test create todo
        success, created_todo = self.run_test(
            "Create todo",
            "POST",
            "todos",
            200,
            data={"task": "Test task"}
        )
        if not success:
            return False

        todo_id = created_todo.get('id')
        if not todo_id:
            print("❌ No todo ID returned")
            return False

        # Test update todo (mark as completed)
        success, updated_todo = self.run_test(
            "Update todo (complete)",
            "PATCH",
            f"todos/{todo_id}",
            200,
            data={"completed": True}
        )
        if not success:
            return False

        # Test get todos with data
        success, todos = self.run_test(
            "Get todos (with data)",
            "GET",
            "todos",
            200
        )
        if not success:
            return False

        # Test delete todo
        success, _ = self.run_test(
            "Delete todo",
            "DELETE",
            f"todos/{todo_id}",
            200
        )
        return success

    def test_tribute_operations(self):
        """Test tribute CRUD operations"""
        # Test get empty tribute
        success, tribute = self.run_test(
            "Get tribute images (empty)",
            "GET",
            "tribute",
            200
        )
        if not success:
            return False

        # Test create tribute image
        sample_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        success, created_image = self.run_test(
            "Create tribute image",
            "POST",
            "tribute",
            200,
            data={"image_data": sample_image, "caption": "Test tribute"}
        )
        if not success:
            return False

        image_id = created_image.get('id')
        if not image_id:
            print("❌ No tribute image ID returned")
            return False

        # Test get tribute with data
        success, tribute = self.run_test(
            "Get tribute images (with data)",
            "GET",
            "tribute",
            200
        )
        if not success:
            return False

        # Test delete tribute image
        success, _ = self.run_test(
            "Delete tribute image",
            "DELETE",
            f"tribute/{image_id}",
            200
        )
        return success

    def test_theme_operations(self):
        """Test theme settings operations"""
        # Test get theme
        success, theme_data = self.run_test(
            "Get theme settings",
            "GET",
            "settings/theme",
            200
        )
        if not success:
            return False

        # Test update theme to light
        success, _ = self.run_test(
            "Update theme to light",
            "PUT",
            "settings/theme",
            200,
            data={"theme": "light"}
        )
        if not success:
            return False

        # Test update theme back to dark
        success, _ = self.run_test(
            "Update theme to dark",
            "PUT",
            "settings/theme",
            200,
            data={"theme": "dark"}
        )
        return success

def main():
    print("🚀 Starting Memory Vault API Testing...")
    print("=" * 50)
    
    tester = MemoryVaultAPITester()
    
    # Test authentication
    print("\n📋 AUTHENTICATION TESTS")
    print("-" * 30)
    if not tester.test_login_valid():
        print("❌ Login failed, stopping tests")
        return 1
    
    tester.test_login_invalid()
    tester.test_verify_token()
    
    # Test all endpoints
    print("\n📋 GALLERY TESTS")
    print("-" * 30)
    tester.test_gallery_operations()
    
    print("\n📋 ACHIEVEMENTS TESTS")
    print("-" * 30)
    tester.test_achievements_operations()
    
    print("\n📋 TODOS TESTS")
    print("-" * 30)
    tester.test_todos_operations()
    
    print("\n📋 TRIBUTE TESTS")
    print("-" * 30)
    tester.test_tribute_operations()
    
    print("\n📋 THEME TESTS")
    print("-" * 30)
    tester.test_theme_operations()
    
    # Print results
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS")
    print("=" * 50)
    print(f"Tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Tests failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success rate: {(tester.tests_passed / tester.tests_run * 100):.1f}%")
    
    if tester.failed_tests:
        print("\n❌ FAILED TESTS:")
        for i, test in enumerate(tester.failed_tests, 1):
            print(f"{i}. {test['test']}")
            if 'error' in test:
                print(f"   Error: {test['error']}")
            else:
                print(f"   Expected: {test['expected']}, Got: {test['actual']}")
                if test.get('response'):
                    print(f"   Response: {test['response']}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())
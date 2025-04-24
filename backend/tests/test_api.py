from fastapi.testclient import TestClient
from main import app
import pytest
from PIL import Image
import io
import numpy as np
import cv2

client = TestClient(app)

def test_root_endpoint():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to Reciply API"}

def test_scan_receipt():
    # Create a dummy image
    image = Image.new('RGB', (100, 100), color='white')
    image_byte_arr = io.BytesIO()
    image.save(image_byte_arr, format='JPEG')
    image_byte_arr = image_byte_arr.getvalue()

    # Test receipt scanning
    response = client.post(
        "/scan",
        files={"file": ("test_receipt.jpg", image_byte_arr, "image/jpeg")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert "merchant" in data
    assert "date" in data
    assert "confidence" in data

def test_get_expenses():
    response = client.get("/expenses")
    assert response.status_code == 200
    assert isinstance(response.json()["expenses"], list)

def test_get_expenses_with_dates():
    response = client.get("/expenses?start_date=2023-01-01&end_date=2023-12-31")
    assert response.status_code == 200
    assert isinstance(response.json()["expenses"], list)

def test_get_insights():
    response = client.get("/insights")
    assert response.status_code == 200
    assert isinstance(response.json()["insights"], list)

def test_invalid_image_format():
    # Send a text file instead of an image
    response = client.post(
        "/scan",
        files={"file": ("test.txt", b"not an image", "text/plain")}
    )
    assert response.status_code == 500

def test_missing_file():
    response = client.post("/scan")
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_receipt_processing():
    # Create a more realistic test image
    image = np.zeros((500, 500, 3), dtype=np.uint8)
    image[100:400, 100:400] = 255  # White square in the middle
    
    # Convert to bytes
    _, buffer = cv2.imencode('.jpg', image)
    image_bytes = buffer.tobytes()
    
    response = client.post(
        "/scan",
        files={"file": ("receipt.jpg", image_bytes, "image/jpeg")}
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["confidence"] >= 0.0
    assert data["confidence"] <= 1.0

def test_error_handling():
    # Test with an invalid date format
    response = client.get("/expenses?start_date=invalid-date")
    assert response.status_code == 422 
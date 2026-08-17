# AI-Skin-Intelligence-Personalized-Skincare-Planner

AI Skin Intelligence is a web application that uses machine learning to analyze skin images and provide useful information about possible skin conditions.

The main goal of this project is to make basic skin analysis more accessible through an easy-to-use web application. Users can upload a skin image, provide some personal information, and get an AI-generated analysis along with suggestions and precautions.

# Features

- User registration and login
- Upload skin images for analysis
- AI-based skin condition prediction
- Prediction results with confidence scores
- Personalized suggestions and precautions
- Previous analysis history
- Product recommendations
- Personalized daily skincare routine
- Previous medical report and product information
- Skin care chatbot

# Machine Learning Model

For the skin condition prediction, I used the EfficientNet-B0 model with transfer learning.

The model was trained using the HAM10000 dataset, which contains 10,015 dermatoscopic images belonging to 7 different skin condition classes.

The model was trained using PyTorch in Google Colab with a Tesla T4 GPU.

# Skin Conditions

The model can classify the following 7 categories:

- Actinic Keratoses (akiec)
- Basal Cell Carcinoma (bcc)
- Benign Keratosis (bkl)
- Dermatofibroma (df)
- Melanoma (mel)
- Melanocytic Nevi (nv)
- Vascular Lesions (vasc)

# Technologies Used

# Frontend
- React.js
- Vite
- Tailwind CSS

# Backend
- Python
- FastAPI
- Pydantic

# Machine Learning
- PyTorch
- Torchvision
- EfficientNet-B0

# Database
- PostgreSQL

# Tools
- Git & GitHub
- Google Colab
- Kaggle

# How the Application Works

1. The user creates an account and logs in.
2. The user provides basic skin-related information.
3. A skin image is uploaded through the dashboard.
4. The image is sent to the FastAPI backend.
5. The trained EfficientNet-B0 model analyzes the image.
6. The predicted skin condition and confidence scores are displayed.
7. The application provides suggestions and precautions based on the result.
8. Users can also view their previous analysis and recommendations.

# Project Structure

text
AI-Skin-Intelligence/
│
├── frontend/
├── backend/
├── README.md
└── ...

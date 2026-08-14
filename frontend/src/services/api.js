// ============================================================
// AI SKIN INTELLIGENCE
// FRONTEND API SERVICE
// ============================================================
//
// This file is responsible for communication between the
// React frontend and the FastAPI backend.
//
// Main responsibilities:
//   1. User authentication
//   2. Skin image analysis
//   3. Scan history
//   4. History deletion
//   5. Skin comparison
//   6. GlowAI chatbot
//
// Backend base URL:
//   http://localhost:8000/api
// ============================================================

import axios from 'axios';


// ============================================================
// 1. API BASE URL
// ============================================================

const API_BASE_URL = 'http://localhost:8000/api';


// ============================================================
// 2. AXIOS INSTANCE
// ============================================================
//
// A dedicated Axios instance keeps all API requests connected
// to the FastAPI backend through one base URL.
// ============================================================

const api = axios.create({
  baseURL: API_BASE_URL,
});


// ============================================================
// 3. REQUEST INTERCEPTOR
// ============================================================
//
// Before every protected API request, check whether a JWT
// authentication token exists.
//
// The application primarily uses sessionStorage.
//
// localStorage is also checked to maintain compatibility with
// older versions of the application.
// ============================================================

api.interceptors.request.use(
  (config) => {

    const token =
      sessionStorage.getItem('token') ||
      localStorage.getItem('token');

    if (token) {

      config.headers =
        config.headers || {};

      config.headers.Authorization =
        `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// ============================================================
// 4. RESPONSE INTERCEPTOR
// ============================================================
//
// Currently the interceptor simply forwards successful and
// failed responses.
//
// Keeping this section allows centralized error handling to be
// added later without changing every API function.
// ============================================================

api.interceptors.response.use(
  (response) => response,

  (error) => {
    return Promise.reject(error);
  }
);


// ============================================================
// 5. USER LOGIN
// ============================================================
//
// Sends username and password to:
//
// POST /api/auth/login
//
// On successful login, the JWT token and username are stored
// in sessionStorage.
// ============================================================

export const loginUser = async (
  username,
  password
) => {

  const response = await api.post(
    '/auth/login',
    {
      username,
      password,
    }
  );

  if (response.data?.access_token) {

    sessionStorage.setItem(
      'token',
      response.data.access_token
    );

    sessionStorage.setItem(
      'username',
      username
    );
  }

  return response.data;
};


// ============================================================
// 6. USER LOGOUT
// ============================================================
//
// Removes authentication information from both sessionStorage
// and localStorage.
// ============================================================

export const logoutUser = () => {

  sessionStorage.removeItem(
    'token'
  );

  sessionStorage.removeItem(
    'username'
  );

  localStorage.removeItem(
    'token'
  );

  localStorage.removeItem(
    'username'
  );
};


// ============================================================
// 7. USER REGISTRATION
// ============================================================
//
// Sends new user credentials to:
//
// POST /api/auth/register
// ============================================================

export const registerUser = async (
  username,
  password
) => {

  const response = await api.post(
    '/auth/register',
    {
      username,
      password,
    }
  );

  return response.data;
};


// ============================================================
// 8. SKIN ANALYSIS
// ============================================================
//
// Sends the following information to the backend:
//
//   - Facial image
//   - Age
//   - Gender
//   - Skin type
//   - Optional personal query
//
// Backend endpoint:
//
// POST /api/analyze-skin
//
// The function supports both:
//
// analyzeSkin({
//   file,
//   age,
//   gender,
//   skinType,
//   personalQuery
// })
//
// AND:
//
// analyzeSkin(file, {
//   age,
//   gender,
//   skinType,
//   personalQuery
// })
//
// This keeps the function compatible with the existing
// SkinScanner component.
// ============================================================

export const analyzeSkin = async (
  fileOrDetails,
  possibleDetails = null
) => {

  let file;
  let age;
  let gender;
  let skinType;
  let personalQuery;


  // ==========================================================
  // FORMAT 1
  // ==========================================================
  //
  // analyzeSkin({
  //   file,
  //   age,
  //   gender,
  //   skinType,
  //   personalQuery
  // })
  // ==========================================================

  if (
    fileOrDetails &&
    typeof fileOrDetails === 'object' &&
    !(fileOrDetails instanceof File) &&
    fileOrDetails.file
  ) {

    const details =
      fileOrDetails;

    file =
      details.file;

    age =
      details.age;

    gender =
      details.gender ??
      details.sex;

    skinType =
      details.skinType ??
      details.skin_type;

    personalQuery =
      details.personalQuery ??
      details.personal_query;
  }


  // ==========================================================
  // FORMAT 2
  // ==========================================================
  //
  // analyzeSkin(file, userDetails)
  // ==========================================================

  else {

    file =
      fileOrDetails;

    const details =
      possibleDetails || {};

    age =
      details.age;

    gender =
      details.gender ??
      details.sex;

    skinType =
      details.skinType ??
      details.skin_type;

    personalQuery =
      details.personalQuery ??
      details.personal_query;
  }


  // ==========================================================
  // 8.1 NORMALIZE INPUT VALUES
  // ==========================================================

  if (
    typeof skinType === 'string'
  ) {

    skinType =
      skinType.trim();
  }

  if (
    typeof gender === 'string'
  ) {

    gender =
      gender.trim();
  }

  if (
    typeof personalQuery !== 'string'
  ) {

    personalQuery = '';
  }


  // ==========================================================
  // 8.2 FRONTEND VALIDATION
  // ==========================================================
  //
  // Validate required fields before sending the request.
  //
  // This prevents unnecessary API calls and gives the user a
  // clear message when information is missing.
  // ==========================================================

  if (!file) {

    throw new Error(
      'Please upload or capture a skin image first.'
    );
  }

  if (
    age === undefined ||
    age === null ||
    age === ''
  ) {

    throw new Error(
      'Please enter your age before running the diagnostic.'
    );
  }

  if (!gender) {

    throw new Error(
      'Please select your gender before running the diagnostic.'
    );
  }

  if (!skinType) {

    throw new Error(
      'Please select your skin type before running the diagnostic.'
    );
  }


  // ==========================================================
  // 8.3 CREATE MULTIPART FORM DATA
  // ==========================================================
  //
  // FastAPI receives the uploaded image using UploadFile and
  // the remaining fields using Form(...).
  //
  // Therefore FormData is required here.
  // ==========================================================

  const formData =
    new FormData();

  formData.append(
    'file',
    file
  );

  formData.append(
    'age',
    String(age)
  );

  formData.append(
    'gender',
    String(gender)
  );

  formData.append(
    'skin_type',
    String(skinType).toLowerCase()
  );

  formData.append(
    'personal_query',
    personalQuery.trim()
  );


  // ==========================================================
  // 8.4 DEBUG INFORMATION
  // ==========================================================
  //
  // Useful during development if an API request fails.
  // ==========================================================

  console.log(
    '========== SKIN ANALYSIS REQUEST =========='
  );

  console.log(
    'Age:',
    age
  );

  console.log(
    'Gender:',
    gender
  );

  console.log(
    'Skin Type:',
    skinType
  );

  console.log(
    'Personal Query:',
    personalQuery
  );

  console.log(
    'File:',
    file?.name
  );

  console.log(
    '============================================'
  );


  // ==========================================================
  // 8.5 SEND ANALYSIS REQUEST
  // ==========================================================

  try {

    const response =
      await api.post(
        '/analyze-skin',
        formData
      );

    console.log(
      'Skin analysis successful:',
      response.data
    );

    return response.data;

  }

  catch (error) {

    console.error(
      '========== SKIN ANALYSIS ERROR =========='
    );

    console.error(
      'Status:',
      error?.response?.status
    );

    console.error(
      'Response:',
      error?.response?.data
    );

    console.error(
      'Message:',
      error?.message
    );

    console.error(
      '========================================='
    );


    // ========================================================
    // 8.6 HANDLE FASTAPI VALIDATION ERROR
    // ========================================================

    if (
      error?.response?.status === 422
    ) {

      const detail =
        error?.response?.data?.detail;


      if (
        Array.isArray(detail)
      ) {

        const messages =
          detail
            .map((item) => {

              if (
                typeof item === 'string'
              ) {

                return item;
              }

              return (
                item?.msg ||
                'Invalid input.'
              );
            })
            .filter(Boolean);


        throw new Error(
          messages.join(' ')
        );
      }


      if (
        typeof detail === 'string' &&
        detail.trim()
      ) {

        throw new Error(
          detail
        );
      }


      throw new Error(
        'The submitted diagnostic information is invalid.'
      );
    }


    // ========================================================
    // 8.7 HANDLE AUTHENTICATION ERROR
    // ========================================================

    if (
      error?.response?.status === 401
    ) {

      throw new Error(
        'Your session has expired. Please log in again.'
      );
    }


    // ========================================================
    // 8.8 HANDLE BACKEND ERROR
    // ========================================================

    if (
      error?.response?.data?.detail
    ) {

      const detail =
        error.response.data.detail;


      if (
        typeof detail === 'string'
      ) {

        throw new Error(
          detail
        );
      }


      if (
        Array.isArray(detail)
      ) {

        throw new Error(
          detail
            .map(
              (item) =>
                item?.msg ||
                String(item)
            )
            .join(' ')
        );
      }
    }


    // ========================================================
    // 8.9 GENERAL ERROR
    // ========================================================

    throw new Error(
      error?.message ||
      'Skin analysis failed. Please try again.'
    );
  }
};


// ============================================================
// 9. GET SCAN HISTORY
// ============================================================
//
// Retrieves the logged-in user's previous skin scans.
//
// GET /api/scan-history
// ============================================================

export const getScanHistory = async () => {

  const response =
    await api.get(
      '/scan-history'
    );

  return response.data;
};


// ============================================================
// 10. CLEAR SCAN HISTORY
// ============================================================
//
// Deletes all scan records belonging to the logged-in user.
//
// DELETE /api/scan-history
// ============================================================

export const clearScanHistory = async () => {

  const response =
    await api.delete(
      '/scan-history'
    );

  return response.data;
};


// ============================================================
// 11. SKIN COMPARISON
// ============================================================
//
// The backend automatically compares:
//
// Previous scan → Latest scan
//
// Endpoint:
//
// GET /api/comparison
//
// The backend returns:
//
//   - Before scan
//   - After scan
//   - Six-class probability changes
//   - Confidence change
//   - AI-generated comparison report
// ============================================================

export const getComparison = async () => {

  const response =
    await api.get(
      '/comparison'
    );

  return response.data;
};


// ============================================================
// 12. GLOWAI GREETING
// ============================================================
//
// Retrieves a personalized greeting based on the user's latest
// skin scan.
//
// GET /api/chat/greeting
// ============================================================

export const fetchGreeting = async () => {

  const response =
    await api.get(
      '/chat/greeting'
    );

  return response.data;
};


// ============================================================
// 13. GLOWAI CHATBOT
// ============================================================
//
// Sends a user's message to GlowAI.
//
// POST /api/chat
// ============================================================

export const sendChatMessage = async (
  message
) => {

  const response =
    await api.post(
      '/chat',
      {
        message,
      }
    );

  return response.data;
};


// ============================================================
// 14. DEFAULT EXPORT
// ============================================================
//
// Components can import the Axios instance directly when
// required:
//
// import api from '../services/api';
// ============================================================

export default api;
# SkinSense AI

Build a complete production-ready full-stack web application called:

AI SKIN INTELLIGENCE & PERSONALIZED SKINCARE PLANNER

============================================================

1. PROJECT GOAL

============================================================

Create a modern AI-powered skincare platform that allows users to:

1. Register and log in

2. Create a personal skin profile

3. Upload a skin image

4. Analyze the image using an AI skin-condition model

5. Display the predicted skin condition and confidence

6. Display Grad-CAM explainability

7. Generate a personalized 7-day skincare plan

8. Track daily skincare tasks

9. Chat with an AI skincare chatbot

10. Permanently store chatbot conversations

11. Store skin assessment history

12. Store skincare routine history

13. Track skin progress

14. Compare before/after images

15. Calculate an AI Skin Health Score

16. Generate weekly reports

17. Automatically generate the next week's plan

18. Provide ingredient intelligence

19. Provide product recommendations

20. Provide reminders and notifications

This must be a REAL working application, not only a static UI.

============================================================

2. DATASET

============================================================

Use the following Kaggle dataset as the project's skin image dataset:

https://www.kaggle.com/datasets/harishnivasagam/multi-class-skin-condition-image-dataset-msc-6

The six classes are:

- Acne

- Eczema

- Dark Spots

- Rosacea

- Wrinkles

- Normal Skin

IMPORTANT:

The application must use these six MSC-6 classes.

Do NOT replace them with other skin-disease classes.

The IEEE paper used for the project is research background for CNN-based skin-condition classification. Do not claim that the MSC-6 dataset is identical to the Xiangya-Derm dataset used in the IEEE paper.

============================================================

3. TECHNOLOGY

============================================================

Frontend:

- React

- TypeScript

- Vite

- Tailwind CSS

- shadcn/ui

- React Router

- Recharts

- Lucide icons

Backend:

Use Lovable's supported backend architecture.

Prefer:

- Supabase

- PostgreSQL

- Supabase Authentication

- Supabase Storage

- Supabase Edge Functions

AI:

Create an API/service abstraction for:

- EfficientNetV2B0

- TensorFlow/Keras model

- LLM chatbot

The AI model must be replaceable without rewriting the frontend.

============================================================

4. DESIGN

============================================================

Create a premium, modern skincare/AI-health dashboard.

Design style:

- Clean

- Professional

- Minimal

- Modern

- Soft rounded cards

- Elegant typography

- Accessible contrast

- Responsive

- Mobile-friendly

Create both:

Light mode

Dark mode

Use a professional skincare aesthetic.

Avoid making it look like a generic admin dashboard.

============================================================

5. APPLICATION NAVIGATION

============================================================

Create a sidebar/navigation containing:

Dashboard

Skin Analysis

7-Day Plan

AI Chatbot

Assessment History

Progress

Before & After

Ingredients

Products

Weekly Review

Profile

Settings

Mobile navigation must use a responsive menu.

============================================================

6. LANDING PAGE

============================================================

Create a beautiful landing page.

Hero:

"AI Skin Intelligence"

Subtitle:

"Understand your skin, build a personalized routine, and track your skincare journey with AI."

Buttons:

"Start Skin Analysis"

"Explore Features"

Feature cards:

AI Skin Analysis

Personalized 7-Day Plan

AI Skincare Chatbot

Progress Tracking

Before & After

Smart Recommendations

Include a disclaimer:

"AI skin assessments are for informational and educational purposes and are not a medical diagnosis."

============================================================

7. AUTHENTICATION

============================================================

Implement:

- Sign up

- Login

- Logout

- Forgot password

- Password reset

- Protected routes

Use Supabase Authentication.

Every user's data must be isolated using Row Level Security.

User A must never access User B's:

- Skin images

- Assessments

- Chat history

- Routine history

- Progress

- Profile

============================================================

8. USER PROFILE

============================================================

Create a detailed profile page.

Fields:

Name

Age

Age group

Skin type

Skin concerns

Allergies

Ingredient sensitivities

Current skincare products

Lifestyle

Sleep quality

Daily water intake

Sun exposure

Environmental exposure

Skincare goals

Budget preference

Skin type:

- Oily

- Dry

- Combination

- Normal

- Sensitive

Skin concerns:

- Acne

- Dark Spots

- Hyperpigmentation

- Redness

- Dryness

- Wrinkles

- Fine Lines

- Uneven Skin Tone

Allow multiple concerns.

Store the profile in Supabase PostgreSQL.

============================================================

9. DASHBOARD

============================================================

Create a personalized dashboard.

Top cards:

Current Skin Condition

AI Confidence

AI Skin Health Score

Routine Adherence

Example:

Current Condition

Acne

Confidence

82.4%

Skin Health Score

74/100

Routine Adherence

86%

Below the cards display:

Today's Routine

7-Day Plan

Recent Assessment

Progress Chart

AI Chatbot

Weekly Summary

Before/After

============================================================

10. SKIN ANALYSIS PAGE

============================================================

Create:

/skin-analysis

Allow users to:

- Upload JPG

- Upload JPEG

- Upload PNG

- Drag and drop

- Preview image

- Remove image

- Analyze image

After analysis show:

AI Skin Assessment

Detected Condition:

Acne

Confidence:

82.4%

Top Predictions:

Acne 82.4%

Rosacea 8.7%

Eczema 4.3%

Buttons:

"Generate 7-Day Plan"

"Ask AI Assistant"

"View Explanation"

============================================================

11. AI MODEL INTEGRATION

============================================================

The frontend must NOT fake AI predictions.

Create a clean AI service interface:

analyzeSkin(image)

The expected response:

{

  condition: string,

  confidence: number,

  topPredictions: [

    {

      condition: string,

      confidence: number

    }

  ],

  modelVersion: string,

  gradcamUrl: string

}

The supported classes are:

acne

eczema

dark_spots

rosacea

wrinkles

normal_skin

If the model backend is unavailable, display:

"AI model is currently unavailable."

Do NOT create fake prediction results.

============================================================

12. MODEL ARCHITECTURE

============================================================

The backend model should support:

EfficientNetV2B0

Architecture:

Input

↓

EfficientNetV2B0

↓

GlobalAveragePooling2D

↓

Dense 256 ReLU

↓

Dropout 0.5

↓

Dense 6 Softmax

Input size:

300 x 300

Training should support:

- Transfer learning

- Data augmentation

- Class weights

- AdamW

- Early stopping

- Model checkpoint

- ReduceLROnPlateau

- Fine tuning

The trained model should be loaded from the backend/model service.

============================================================

13. GRAD-CAM

============================================================

After skin analysis generate a Grad-CAM visualization.

Display:

Original Image

and

AI Attention Visualization

Label:

"AI attention visualization"

Explain:

"This visualization highlights image regions that influenced the model's classification. It is not a clinical diagnostic map."

============================================================

14. AI SKIN HEALTH SCORE

============================================================

Calculate:

Skin Condition Assessment = 35%

Lifestyle Habits = 20%

Sleep Quality = 15%

Routine Consistency = 20%

Hydration = 10%

Formula:

Skin Health Score =

condition × 0.35

+

lifestyle × 0.20

+

sleep × 0.15

+

routine × 0.20

+

hydration × 0.10

Display score:

0-39 = Poor

40-59 = Needs Attention

60-74 = Fair

75-89 = Good

90-100 = Excellent

Call this:

"AI Skin Health Score"

Do not describe this as a medical score.

============================================================

15. PERSONALIZED 7-DAY PLAN

============================================================

Create:

/routine

Generate a personalized 7-day skincare routine.

The routine must use:

- Latest skin assessment

- Skin type

- Skin concerns

- Allergies

- Sensitivities

- Lifestyle

- Sleep

- Hydration

- Current products

- Skincare goals

- Previous routine adherence

- Previous progress

- User feedback

Do NOT generate exactly the same routine for every user.

============================================================

16. DAY 1

============================================================

Title:

Skin Reset

Morning:

Gentle cleanser

Hydrating moisturizer

Sunscreen

Evening:

Gentle cleanser

Suitable treatment

Moisturizer

============================================================

17. DAY 2

============================================================

Title:

Hydration & Barrier Support

Morning:

Gentle cleanser

Hydrating product

Moisturizer

Sunscreen

Evening:

Gentle cleanser

Hydrating treatment

Moisturizer

============================================================

18. DAY 3

============================================================

Title:

Targeted Care

Adapt according to assessment.

Acne:

Acne-focused routine.

Eczema:

Gentle barrier-support routine.

Dark Spots:

Pigmentation-support routine.

Rosacea:

Gentle redness-sensitive routine.

Wrinkles:

Hydration/anti-aging-support routine.

Normal Skin:

Maintenance routine.

Do not prescribe prescription medication.

============================================================

19. DAY 4

============================================================

Title:

Recovery Day

Morning:

Gentle cleanser

Moisturizer

Sunscreen

Evening:

Gentle cleanser

Moisturizer

============================================================

20. DAY 5

============================================================

Title:

Targeted Care

Adapt the routine according to:

Current assessment

User feedback

Previous routine adherence

============================================================

21. DAY 6

============================================================

Title:

Progress Check

Ask the user to upload a new image.

Compare:

Initial image

Current image

Show:

Previous condition

Current condition

Previous confidence

Current confidence

Previous AI Skin Health Score

Current AI Skin Health Score

Use the label:

"Visual Progress Indicator"

Do NOT claim that this proves medical improvement.

============================================================

22. DAY 7

============================================================

Title:

Weekly Review

Show:

Starting Score

Ending Score

Score Change

Routine Adherence

Hydration

Sleep

Completed Tasks

Missed Tasks

Latest Assessment

Previous Assessment

Chatbot Insights

Then generate:

"Next Week's Personalized Plan"

============================================================

23. DAILY CHECKLIST

============================================================

Every day show:

[ ] Cleanser

[ ] Treatment

[ ] Moisturizer

[ ] Sunscreen

[ ] Hydration

[ ] Sleep

Allow users to check/uncheck tasks.

Save every completion to the database.

Calculate:

Routine Adherence =

completed tasks / total tasks × 100

============================================================

24. USER FEEDBACK

============================================================

At the end of each day ask:

"How did your skin feel today?"

Options:

Better

Same

Slightly irritated

Very irritated

Unsure

Store the response.

Use the feedback when generating future routines.

============================================================

25. AI CHATBOT

============================================================

Create:

/chatbot

Also create a floating chatbot button throughout the application.

Name:

"SkinCare AI Assistant"

UI:

-------------------------------------

SkinCare AI Assistant

-------------------------------------

Hi! 👋

I can help you with your skincare

routine, assessment and progress.

Quick actions:

[Today's Routine]

[My 7-Day Plan]

[My Progress]

[My History]

[Ingredients]

[Products]

Type your question...

[Send]

-------------------------------------

============================================================

26. CHATBOT MEMORY

============================================================

The chatbot must remember relevant information for the CURRENT USER.

Context:

User profile

Skin type

Skin concerns

Allergies

Sensitivities

Latest assessment

Confidence

AI Skin Health Score

Current routine

Routine completion

Progress

Weekly reviews

Relevant previous conversations

Example:

User:

"What did I tell you yesterday?"

The chatbot should retrieve the user's previous stored conversation.

User:

"What should I do tonight?"

The chatbot should use today's actual routine.

User:

"Why did you recommend this?"

Explain the recommendation based on the user's stored profile and assessment.

============================================================

27. CHAT HISTORY

============================================================

Persist every conversation in Supabase.

Create table:

chat_messages

Fields:

id

user_id

session_id

role

message

timestamp

skin_condition_at_time

confidence_at_time

routine_day

Create:

/chat-history

Features:

- Search

- Filter by date

- Open conversation

- Delete conversation

- New conversation

============================================================

28. CHATBOT QUESTIONS

============================================================

The chatbot must support:

"What should I do this morning?"

"What should I do tonight?"

"Show my 7-day plan."

"Why did you recommend this routine?"

"What does my skin assessment mean?"

"Explain this ingredient."

"Show my previous assessments."

"Did my skin improve?"

"What routine did I miss?"

"How consistent was I this week?"

"What did we discuss last week?"

"What should I do next week?"

============================================================

29. ASSESSMENT HISTORY

============================================================

Create:

/assessment-history

Store:

Assessment ID

User ID

Image

Date

Predicted condition

Confidence

Top predictions

AI Skin Health Score

Model version

Grad-CAM

Display as a timeline.

Example:

August 15

Acne

82.4%

Score 74

August 8

Acne

78.1%

Score 69

August 1

Normal Skin

71.5%

Score 65

============================================================

30. PROGRESS PAGE

============================================================

Create:

/progress

Show:

Current Score

Previous Score

Score Change

Routine Adherence

Hydration

Sleep

Confidence

Create charts using Recharts:

1. AI Skin Health Score over time

2. Routine adherence over time

3. Hydration

4. Sleep

5. Prediction confidence

============================================================

31. BEFORE & AFTER

============================================================

Create:

/before-after

Allow:

Initial Image

Current Image

Display side-by-side.

Show:

Initial assessment

Current assessment

Initial confidence

Current confidence

Initial score

Current score

Use:

"Visual Progress Indicator"

Never state:

"Your skin disease is cured."

============================================================

32. INGREDIENT INTELLIGENCE

============================================================

Create:

/ingredients

Include:

Retinoids

Niacinamide

Vitamin C

Hyaluronic Acid

Salicylic Acid

Ceramides

Peptides

AHAs

BHAs

Each ingredient must display:

Purpose

Suitable skin concerns

Possible irritation

Compatibility

General usage guidance

Warnings

Before recommending an ingredient:

Check the user's:

Allergies

Sensitivities

Current products

If there is a conflict, do not recommend the ingredient.

============================================================

33. PRODUCTS

============================================================

Create:

/products

Categories:

Face Wash

Moisturizer

Sunscreen

Serum

Toner

Treatment

Face Mask

Allow:

Search

Filter

Sort

Budget filtering

Ingredient filtering

Product comparison

Recommendations should use:

Skin type

Skin concern

AI assessment

Allergies

Sensitivities

Budget

Do not make unsupported medical claims.

============================================================

34. WEEKLY REVIEW

============================================================

Create:

/weekly-review

Generate a weekly report containing:

Weekly Summary

Starting Score

Ending Score

Score Change

Routine Adherence

Hydration

Sleep

Completed Tasks

Missed Tasks

Assessment History

Chatbot Insights

Visual Progress

Recommendations

Next Week's Plan

Allow:

Export PDF

Export CSV/Excel if supported

============================================================

35. NOTIFICATIONS

============================================================

Create reminders for:

Morning routine

Evening routine

Hydration

Sleep

Weekly assessment

Progress check

Product replenishment

Allow users to enable/disable notifications.

============================================================

36. DATABASE

============================================================

Use Supabase PostgreSQL.

Create tables:

profiles

assessments

assessment_predictions

routines

routine_days

routine_tasks

routine_completion

progress

daily_feedback

weekly_reviews

chat_sessions

chat_messages

ingredients

products

product_ingredients

notifications

Use Supabase Storage for:

- Skin images

- Before/after images

- Grad-CAM images

============================================================

37. DATABASE SECURITY

============================================================

Enable Row Level Security.

Every table containing user information must have policies so that:

Users can SELECT their own data.

Users can INSERT their own data.

Users can UPDATE their own data.

Users can DELETE their own data where appropriate.

Users cannot access another user's data.

============================================================

38. CHATBOT API

============================================================

Create a backend/Edge Function for chatbot requests.

Input:

{

  user_id,

  session_id,

  message

}

Retrieve:

profile

latest assessment

current routine

progress

relevant chat history

Send appropriate context to the LLM.

Return:

{

  response,

  session_id

}

Never expose API keys to the frontend.

============================================================

39. LLM CONFIGURATION

============================================================

Keep the LLM provider configurable.

Use environment variables.

Do not hard-code API keys.

If the LLM is unavailable:

Use a safe fallback for:

Today's routine

7-day plan

Assessment history

Progress

Ingredient information

Never invent information.

============================================================

40. SAFETY

============================================================

The chatbot must never say:

"You definitely have..."

Instead use:

"Your AI assessment indicates..."

The chatbot must never claim:

"Your condition is cured."

It should say:

"Your latest assessment shows a change."

For concerning symptoms, recommend consultation with a qualified dermatologist.

Do not prescribe prescription medications.

============================================================

41. SECURITY

============================================================

Implement:

- Authentication

- Authorization

- RLS

- Secure storage

- Input validation

- API error handling

- Secure environment variables

- Protected routes

============================================================

42. RESPONSIVE DESIGN

============================================================

The entire application must work on:

Desktop

Laptop

Tablet

Mobile

Ensure:

- Responsive sidebar

- Mobile navigation

- Responsive cards

- Responsive charts

- Responsive chatbot

- Responsive image comparison

============================================================

43. LOADING STATES

============================================================

Create professional loading states for:

Image analysis

Chatbot response

Routine generation

Progress loading

History loading

Use skeletons/spinners where appropriate.

============================================================

44. ERROR STATES

============================================================

Handle:

Invalid image

Large image

Unsupported format

AI model unavailable

LLM unavailable

Database error

Network error

Unauthorized access

Missing profile

Empty chatbot message

Show user-friendly messages.

============================================================

45. EMPTY STATES

============================================================

Create useful empty states.

Example:

"No skin assessments yet."

Button:

"Analyze Your Skin"

No chat history:

"Start your first conversation with SkinCare AI."

No progress:

"Complete your first assessment to start tracking progress."

============================================================

46. ACCESSIBILITY

============================================================

Implement:

- Keyboard navigation

- Accessible buttons

- Labels

- ARIA where necessary

- Good color contrast

- Alt text for images

============================================================

47. ADMIN / MODEL PAGE

============================================================

Create an optional protected developer/admin page.

Show actual model metrics if available:

Accuracy

Precision

Recall

F1-score

Confusion Matrix

ROC/AUC

Never display fake metrics.

============================================================

48. PROJECT STRUCTURE

============================================================

Use a clean structure.

src/

components/

pages/

layouts/

services/

hooks/

contexts/

lib/

types/

utils/

Important components:

Dashboard

SkinAnalyzer

AssessmentResult

GradCAMViewer

WeeklyPlanner

RoutineChecklist

Chatbot

ChatHistory

ProgressDashboard

BeforeAfter

IngredientCard

ProductCard

WeeklyReview

ProfileForm

NotificationPanel

============================================================

49. API SERVICE LAYER

============================================================

Create reusable service functions:

analyzeSkin()

getAssessmentHistory()

generateRoutine()

getCurrentRoutine()

completeRoutineTask()

getProgress()

sendChatMessage()

getChatHistory()

getWeeklyReview()

getIngredients()

getProducts()

Do not put API calls directly into every UI component.

============================================================

50. PERFORMANCE

============================================================

Optimize:

- Image compression before upload

- Lazy loading

- Code splitting

- Cached data where appropriate

- Efficient database queries

- Pagination for chat history

- Pagination for assessment history

============================================================

51. README

============================================================

Create a README containing:

Project Overview

Features

Architecture

Dataset

AI Model

MSC-6 Classes

Frontend Setup

Supabase Setup

Environment Variables

AI Model Setup

LLM Setup

Running the Project

Deployment

Database Schema

Security

API Documentation

Troubleshooting

============================================================

52. IMPORTANT: NO FAKE DATA

============================================================

Do not create fake:

AI predictions

Model accuracy

Chat history

Assessment history

Progress results

For development UI previews, clearly mark mock/demo data.

The production application must use real database records.

============================================================

53. IMPORTANT: MODEL BACKEND

============================================================

Lovable frontend should be designed so that the trained EfficientNetV2B0 model can be connected through an external FastAPI inference service.

Create a configurable environment variable:

VITE_AI_API_URL

Example:

VITE_AI_API_URL=https://your-ai-backend-url

The frontend should call:

POST /predict

and receive:

{

  "condition": "...",

  "confidence": 0.0,

  "top_predictions": [],

  "gradcam_url": "..."

}

Do not put TensorFlow training inside the React frontend.

============================================================

54. FINAL APPLICATION FLOW

============================================================

The complete user flow must be:

REGISTER

↓

LOGIN

↓

CREATE PROFILE

↓

UPLOAD SKIN IMAGE

↓

AI SKIN ANALYSIS

↓

PREDICTION + CONFIDENCE

↓

GRAD-CAM

↓

AI SKIN HEALTH SCORE

↓

PERSONALIZED 7-DAY PLAN

↓

DAILY CHECKLIST

↓

AI CHATBOT

↓

CHAT HISTORY STORED

↓

ASSESSMENT HISTORY STORED

↓

PROGRESS TRACKING

↓

DAY 6 IMAGE

↓

BEFORE/AFTER

↓

DAY 7 WEEKLY REVIEW

↓

NEXT WEEK PERSONALIZED PLAN

↓

LONG-TERM PROGRESS DASHBOARD

============================================================

55. FINAL REQUIREMENT

============================================================

Build the complete application.

Do not stop at the landing page.

Implement the actual:

- Authentication

- Database

- Supabase integration

- Storage

- User profile

- Skin analysis interface

- AI model API integration

- Personalized 7-day planner

- Daily checklist

- AI chatbot

- Persistent chatbot history

- Assessment history

- Progress tracking

- Before/after comparison

- Ingredient intelligence

- Product recommendation interface

- Weekly review

- Notifications

- Responsive dashboard

- Security

- RLS policies

- Error handling

The final result must be suitable for:

- Final-year AI project

- College demonstration

- Project presentation

- Future cloud deployment

Make the application polished, functional, responsive, and easy to extend.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/afef4ae1-af4d-4661-bb72-d3af0413fa60).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

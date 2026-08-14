// ============================================================
// AI SKIN INTELLIGENCE
// BIOMETRIC SKIN SCANNER
// ============================================================
//
// Responsibilities:
//   1. Upload a facial image
//   2. Capture an image using the webcam
//   3. Collect user personalization information
//   4. Send the information to the backend
//   5. Display validation and API errors
//
// Data sent to the backend:
//   - Facial image
//   - Age
//   - Gender
//   - Skin type
//   - Optional personal query
//
// The backend then performs:
//   Image → CNN prediction → Probability distribution
//         → Product recommendation → Groq routine
// ============================================================

import React, {
  useState,
  useRef,
  useEffect,
} from 'react';

import {
  Camera,
  Upload,
  RefreshCw,
  Wand2,
  AlertCircle,
  ScanLine,
  XCircle,
} from 'lucide-react';


// ============================================================
// COMPONENT
// ============================================================

export default function SkinScanner({
  onAnalysisComplete,
  savedPreviewUrl,
  setSavedPreviewUrl,
}) {

  // ==========================================================
  // 1. IMAGE & SCANNER STATE
  // ==========================================================

  const [selectedFile, setSelectedFile] =
    useState(null);

  const [isWebcamActive, setIsWebcamActive] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState('');

  const [webcamStream, setWebcamStream] =
    useState(null);


  // ==========================================================
  // 2. USER PERSONALIZATION STATE
  // ==========================================================
  //
  // These values are manually provided by the user.
  //
  // IMPORTANT:
  // Skin concern and skin type are different concepts.
  //
  // Example:
  //   Acne ≠ automatically oily skin
  //
  // A user with acne can have:
  //   - Oily skin
  //   - Dry skin
  //   - Combination skin
  //   - Sensitive skin
  //   - Normal skin
  //
  // Therefore the application asks the user to select their
  // actual skin type instead of making an unsupported guess.
  // ==========================================================

  const [age, setAge] =
    useState('');

  const [gender, setGender] =
    useState('Male');

  const [skinType, setSkinType] =
    useState('Oily');

  const [personalQuery, setPersonalQuery] =
    useState('');


  // ==========================================================
  // 3. DOM REFERENCES
  // ==========================================================

  const videoRef =
    useRef(null);

  const canvasRef =
    useRef(null);

  const fileInputRef =
    useRef(null);


  // ==========================================================
  // 4. STOP WEBCAM
  // ==========================================================
  //
  // Stops all active camera tracks and releases the webcam.
  // ==========================================================

  const stopWebcam = () => {

    if (webcamStream) {

      webcamStream
        .getTracks()
        .forEach((track) => {
          track.stop();
        });

      setWebcamStream(null);
    }

    if (videoRef.current) {

      videoRef.current.srcObject =
        null;
    }

    setIsWebcamActive(false);
  };


  // ==========================================================
  // 5. CLEANUP WEBCAM WHEN COMPONENT IS UNMOUNTED
  // ==========================================================

  useEffect(() => {

    return () => {

      if (webcamStream) {

        webcamStream
          .getTracks()
          .forEach((track) => {
            track.stop();
          });
      }
    };

  }, [webcamStream]);


  // ==========================================================
  // 6. CONNECT WEBCAM STREAM TO VIDEO ELEMENT
  // ==========================================================

  useEffect(() => {

    if (
      isWebcamActive &&
      webcamStream &&
      videoRef.current
    ) {

      videoRef.current.srcObject =
        webcamStream;
    }

  }, [
    isWebcamActive,
    webcamStream,
  ]);


  // ==========================================================
  // 7. HANDLE IMAGE UPLOAD
  // ==========================================================
  //
  // When the user selects an image:
  //
  //   File → Preview → Ready for Analysis
  // ==========================================================

  const handleFileChange = (event) => {

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }


    // --------------------------------------------------------
    // BASIC FILE VALIDATION
    // --------------------------------------------------------

    if (
      !file.type ||
      !file.type.startsWith('image/')
    ) {

      setError(
        'Please select a valid image file.'
      );

      return;
    }


    // --------------------------------------------------------
    // STOP CAMERA IF IT IS ACTIVE
    // --------------------------------------------------------

    if (isWebcamActive) {

      stopWebcam();
    }


    // --------------------------------------------------------
    // STORE SELECTED FILE
    // --------------------------------------------------------

    setSelectedFile(file);


    // --------------------------------------------------------
    // CREATE IMAGE PREVIEW
    // --------------------------------------------------------

    const url =
      URL.createObjectURL(file);

    setSavedPreviewUrl(url);

    setError('');
  };


  // ==========================================================
  // 8. START WEBCAM
  // ==========================================================

  const startWebcam = async () => {

    setError('');

    setSelectedFile(null);


    // --------------------------------------------------------
    // CHECK BROWSER CAMERA SUPPORT
    // --------------------------------------------------------

    if (
      !navigator.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {

      setError(
        'Camera API is not supported or blocked. Please use HTTPS or localhost.'
      );

      return;
    }


    // --------------------------------------------------------
    // REQUEST CAMERA ACCESS
    // --------------------------------------------------------

    try {

      const stream =
        await navigator.mediaDevices.getUserMedia({

          video: {
            facingMode: 'user',
            width: {
              ideal: 1280,
            },
            height: {
              ideal: 720,
            },
          },

          audio: false,
        });


      setWebcamStream(
        stream
      );

      setIsWebcamActive(
        true
      );

    }

    catch (err) {

      console.error(
        'Webcam initialization error:',
        err
      );


      // ------------------------------------------------------
      // CAMERA PERMISSION ERROR
      // ------------------------------------------------------

      if (
        err.name ===
          'NotAllowedError' ||
        err.name ===
          'PermissionDeniedError'
      ) {

        setError(
          'Camera permission denied. Please allow camera access in your browser.'
        );
      }


      // ------------------------------------------------------
      // CAMERA ALREADY IN USE
      // ------------------------------------------------------

      else if (
        err.name ===
          'NotReadableError' ||
        err.name ===
          'TrackStartError'
      ) {

        setError(
          'Camera is in use by another application.'
        );
      }


      // ------------------------------------------------------
      // OTHER CAMERA ERRORS
      // ------------------------------------------------------

      else {

        setError(
          'Unable to access camera. Please upload an image instead.'
        );
      }


      setIsWebcamActive(
        false
      );
    }
  };


  // ==========================================================
  // 9. CAPTURE WEBCAM PHOTO
  // ==========================================================
  //
  // Captures the current video frame and converts it into a
  // JPEG File so that it can be sent to FastAPI just like an
  // uploaded image.
  // ==========================================================

  const captureWebcamPhoto = () => {

    if (
      !videoRef.current ||
      !canvasRef.current
    ) {

      return;
    }


    const video =
      videoRef.current;

    const canvas =
      canvasRef.current;


    // --------------------------------------------------------
    // SET CANVAS SIZE TO VIDEO SIZE
    // --------------------------------------------------------

    canvas.width =
      video.videoWidth || 640;

    canvas.height =
      video.videoHeight || 480;


    const context =
      canvas.getContext('2d');


    if (!context) {

      setError(
        'Unable to capture camera image.'
      );

      return;
    }


    // --------------------------------------------------------
    // MIRROR IMAGE
    // --------------------------------------------------------
    //
    // The preview is mirrored, so the captured image is also
    // mirrored to match what the user sees.
    // --------------------------------------------------------

    context.save();

    context.scale(
      -1,
      1
    );

    context.drawImage(
      video,
      -canvas.width,
      0,
      canvas.width,
      canvas.height
    );

    context.restore();


    // --------------------------------------------------------
    // CONVERT CANVAS TO JPEG
    // --------------------------------------------------------

    canvas.toBlob(
      (blob) => {

        if (!blob) {

          setError(
            'Unable to create the captured image.'
          );

          return;
        }


        const file =
          new File(
            [blob],
            `webcam_scan_${Date.now()}.jpg`,
            {
              type: 'image/jpeg',
            }
          );


        // ----------------------------------------------------
        // SAVE CAPTURED FILE
        // ----------------------------------------------------

        setSelectedFile(
          file
        );


        // ----------------------------------------------------
        // CREATE PREVIEW
        // ----------------------------------------------------

        const url =
          URL.createObjectURL(file);

        setSavedPreviewUrl(
          url
        );


        // ----------------------------------------------------
        // STOP CAMERA
        // ----------------------------------------------------

        stopWebcam();

        setError('');
      },

      'image/jpeg',

      0.95
    );
  };


  // ==========================================================
  // 10. RUN SKIN ANALYSIS
  // ==========================================================
  //
  // Sends the image and user information to Dashboard.
  //
  // Dashboard calls:
  //
  // analyzeSkin()
  //
  // from services/api.js.
  // ==========================================================

  const handleAnalyze = async () => {

    // --------------------------------------------------------
    // PREVENT DUPLICATE SUBMISSIONS
    // --------------------------------------------------------

    if (loading) {
      return;
    }


    // --------------------------------------------------------
    // IMAGE VALIDATION
    // --------------------------------------------------------

    if (!selectedFile) {

      setError(
        'Please upload or capture a photo first.'
      );

      return;
    }


    // --------------------------------------------------------
    // AGE VALIDATION
    // --------------------------------------------------------
    //
    // Backend currently accepts ages from 13 to 100.
    // Frontend validation should therefore match the backend.
    // --------------------------------------------------------

    const numericAge =
      Number(age);

    if (
      !age ||
      Number.isNaN(numericAge) ||
      numericAge < 13 ||
      numericAge > 100
    ) {

      setError(
        'Please enter a valid age between 13 and 100.'
      );

      return;
    }


    // --------------------------------------------------------
    // GENDER VALIDATION
    // --------------------------------------------------------

    if (!gender) {

      setError(
        'Please select your gender.'
      );

      return;
    }


    // --------------------------------------------------------
    // SKIN TYPE VALIDATION
    // --------------------------------------------------------

    if (!skinType) {

      setError(
        'Please select your skin type.'
      );

      return;
    }


    // --------------------------------------------------------
    // START LOADING
    // --------------------------------------------------------

    setLoading(true);

    setError('');


    try {

      // ------------------------------------------------------
      // SEND DATA TO DASHBOARD
      // ------------------------------------------------------

      await onAnalysisComplete(
        selectedFile,
        {
          age: numericAge,

          gender,

          // api.js accepts both skin_type and skinType.
          skin_type: skinType,

          // Personal query is optional.
          personal_query:
            personalQuery.trim(),
        }
      );


      // ------------------------------------------------------
      // SUCCESS
      // ------------------------------------------------------

      console.log(
        'Skin diagnostic completed successfully.'
      );

    }

    catch (err) {

      console.error(
        'Skin diagnostic error:',
        err
      );


      // ------------------------------------------------------
      // API.JS NORMAL ERROR
      // ------------------------------------------------------
      //
      // Our updated api.js converts backend errors into
      // JavaScript Error objects.
      // ------------------------------------------------------

      const message =
        err?.message ||
        err?.response?.data?.detail ||
        'Analysis failed. Please try another image.';


      setError(
        message
      );

    }

    finally {

      setLoading(false);
    }
  };


  // ==========================================================
  // 11. COMPONENT UI
  // ==========================================================

  return (

    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between h-full">


      {/* ======================================================
          HEADER
          ====================================================== */}

      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">

        <div className="flex items-center gap-2.5">

          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">

            <ScanLine className="w-5 h-5" />

          </div>


          <h3 className="text-base font-extrabold text-slate-900">
            Biometric Scanner
          </h3>

        </div>


        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">

          {isWebcamActive
            ? 'Webcam Active'
            : savedPreviewUrl
            ? 'Image Ready'
            : 'Standby'}

        </span>

      </div>


      {/* ======================================================
          ERROR MESSAGE
          ====================================================== */}

      {error && (

        <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">

          <AlertCircle className="w-4 h-4 flex-shrink-0" />

          <span>
            {error}
          </span>

        </div>

      )}


      {/* ======================================================
          IMAGE VIEWPORT
          ====================================================== */}

      <div className="relative aspect-video w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-200 flex items-center justify-center">


        {/* ----------------------------------------------------
            LIVE WEBCAM
            ---------------------------------------------------- */}

        {isWebcamActive && (

          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover transform -scale-x-100"
          />

        )}


        {/* ----------------------------------------------------
            SELECTED IMAGE PREVIEW
            ---------------------------------------------------- */}

        {!isWebcamActive &&
          savedPreviewUrl && (

            <img
              src={savedPreviewUrl}
              alt="Skin analysis preview"
              className="w-full h-full object-cover"
            />

        )}


        {/* ----------------------------------------------------
            EMPTY STATE
            ---------------------------------------------------- */}

        {!isWebcamActive &&
          !savedPreviewUrl && (

            <div className="text-center p-6 text-slate-400 space-y-1">

              <Camera className="w-10 h-10 mx-auto text-slate-400 mb-2" />

              <p className="text-xs font-bold text-slate-600">
                Upload a photo or enable camera
              </p>

            </div>

        )}


        {/* Hidden canvas used for webcam capture */}
        <canvas
          ref={canvasRef}
          className="hidden"
        />

      </div>


      {/* ======================================================
          IMAGE ACTIONS
          ====================================================== */}

      <div className="mt-5 space-y-3">

        <div className="flex items-center gap-2.5">


          {/* --------------------------------------------------
              HIDDEN FILE INPUT
              -------------------------------------------------- */}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/webp,image/jpg"
            className="hidden"
          />


          {/* =================================================
              NORMAL MODE
              ================================================= */}

          {!isWebcamActive ? (

            <>

              {/* Upload button */}

              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer border border-slate-200"
              >

                <Upload className="w-4 h-4 text-emerald-600" />

                <span>
                  Upload Image
                </span>

              </button>


              {/* Camera button */}

              <button
                type="button"
                onClick={startWebcam}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition cursor-pointer border border-slate-200"
              >

                <Camera className="w-4 h-4 text-emerald-600" />

                <span>
                  Use Camera
                </span>

              </button>

            </>

          ) : (

            /* =================================================
               WEBCAM MODE
               ================================================= */

            <>

              {/* Capture button */}

              <button
                type="button"
                onClick={captureWebcamPhoto}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-md shadow-emerald-950/60"
              >

                <Camera className="w-4 h-4" />

                <span>
                  Snap Snapshot
                </span>

              </button>


              {/* Cancel camera */}

              <button
                type="button"
                onClick={stopWebcam}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold transition cursor-pointer"
              >

                <XCircle className="w-4 h-4 text-rose-600" />

                <span>
                  Cancel Camera
                </span>

              </button>

            </>

          )}

        </div>


        {/* ====================================================
            PERSONAL INFORMATION
            ==================================================== */}

        {savedPreviewUrl && (

          <div className="pt-3 space-y-4">


            {/* =================================================
                AGE
                ================================================= */}

            <div>

              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">

                Age

              </label>


              <input
                type="number"
                min="13"
                max="100"
                value={age}
                onChange={(event) => {

                  setAge(
                    event.target.value
                  );

                  setError('');
                }}
                placeholder="Enter your age"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />

            </div>


            {/* =================================================
                GENDER + SKIN TYPE
                ================================================= */}

            <div className="grid grid-cols-2 gap-3">


              {/* Gender */}

              <div>

                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">

                  Gender

                </label>


                <select
                  value={gender}
                  onChange={(event) => {

                    setGender(
                      event.target.value
                    );

                    setError('');
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >

                  <option value="Male">
                    Male
                  </option>

                  <option value="Female">
                    Female
                  </option>

                </select>

              </div>


              {/* Skin Type */}

              <div>

                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">

                  Skin Type

                </label>


                <select
                  value={skinType}
                  onChange={(event) => {

                    setSkinType(
                      event.target.value
                    );

                    setError('');
                  }}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >

                  <option value="Oily">
                    Oily
                  </option>

                  <option value="Dry">
                    Dry
                  </option>

                  <option value="Combination">
                    Combination
                  </option>

                  <option value="Sensitive">
                    Sensitive
                  </option>

                  <option value="Normal">
                    Normal
                  </option>

                </select>

              </div>

            </div>


            {/* =================================================
                SKIN TYPE GUIDANCE
                =================================================
                This is intentionally guidance, NOT automatic
                classification.
                ================================================= */}

            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5">

              <p className="text-[10px] font-semibold text-slate-500 leading-relaxed">

                <span className="font-bold text-slate-700">
                  Skin type tip:
                </span>{' '}

                Choose the skin type you normally experience.
                A concern such as acne or blackheads does not
                automatically determine your skin type.

              </p>

            </div>


            {/* =================================================
                PERSONAL QUERY
                ================================================= */}

            <div>

              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">

                Personal Query / Situation{' '}

                <span className="text-slate-400 normal-case">
                  (Optional)
                </span>

              </label>


              <textarea
                value={personalQuery}
                onChange={(event) =>
                  setPersonalQuery(
                    event.target.value
                  )
                }
                rows={3}
                placeholder="Example: I have a presentation in 3 days and my forehead is breaking out. Salicylic acid irritated my skin last week."
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />


              <p className="text-[10px] text-slate-400 mt-1">

                You can leave this blank. Your image and
                personal details are enough to generate a
                basic personalized plan.

              </p>

            </div>


            {/* =================================================
                RUN DIAGNOSTIC BUTTON
                ================================================= */}

            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading}
              className="w-full py-3 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold rounded-xl text-xs sm:text-sm transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >

              {loading ? (

                <>

                  <RefreshCw className="w-4 h-4 animate-spin" />

                  <span>
                    Running Diagnostics...
                  </span>

                </>

              ) : (

                <>

                  <Wand2 className="w-4 h-4" />

                  <span>
                    Run Diagnostic & Generate Plan
                  </span>

                </>

              )}

            </button>

          </div>

        )}

      </div>

    </div>
  );
}
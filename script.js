// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC9PvfAHE-Eacy4q2LIa25oC0bxHJ9EQOA",
  authDomain: "smed-attendance-system.firebaseapp.com",
  projectId: "smed-attendance-system",
  storageBucket: "smed-attendance-system.firebasestorage.app",
  messagingSenderId: "318678155548",
  appId: "1:318678155548:web:5f980fb67de3683406fad9",
  measurementId: "G-C4H5BSNSHZ"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();

const authReady = firebase.auth().signInAnonymously()
    .then(function () {
        console.log("Firebase anonymous login successful.");
    })
    .catch(function (error) {
        console.error("Firebase login error:", error);
    });

// ========================================
// STUDENT AND ATTENDANCE STORAGE
// ========================================

let students = JSON.parse(localStorage.getItem("students")) || [];
let attendance = JSON.parse(localStorage.getItem("attendance")) || [];


// ========================================
// GET HTML ELEMENTS
// ========================================

const message = document.getElementById("message");

const scanButton = document.getElementById("scanButton");

const studentName = document.getElementById("studentName");
const studentID = document.getElementById("studentID");
const setYear = document.getElementById("setYear");

const studentPicture = document.getElementById("studentPicture");
const preview = document.getElementById("preview");

const registerButton = document.getElementById("registerButton");

const studentCard = document.getElementById("studentCard");
const qrCode = document.getElementById("qrCode");


// ========================================
// PROFILE PICTURE PREVIEW
// ========================================

studentPicture.addEventListener("change", function () {

    const file = studentPicture.files[0];

    if (file) {

        const reader = new FileReader();

        reader.onload = function (event) {

            preview.src = event.target.result;

        };

        reader.readAsDataURL(file);

    }

});


// ========================================
// REGISTER STUDENT
// ========================================

registerButton.addEventListener("click", function () {

    // Check if all fields are complete

    if (
        studentName.value === "" ||
        studentID.value === "" ||
        setYear.value === "" ||
        !studentPicture.files[0]
    ) {

        message.textContent = "Please complete all fields.";

        return;
    }


    // Create student record

const student = {
    name: studentName.value,
    id: studentID.value,
    setYear: setYear.value,
    photo: preview.src
};


console.log("STUDENT DATA:", student);


    // Add student to students list

    students.push(student);


    // Save students

    localStorage.setItem(
        "students",
        JSON.stringify(students)
    );

// Save student to Firebase Firestore

authReady.then(function () {

    return db.collection("students")
        .doc(student.id)
 .set({
    name: student.name,
    id: student.id,
    setYear: student.setYear,
    photo: student.photo
});

})
.then(function () {

    console.log("Student saved to Firestore:", student.name);

})
.catch(function (error) {

    console.error("Firestore error:", error);

});

    // Display student card

    studentCard.innerHTML = `

        <img
            src="${student.photo}"
            width="250"
        >

        <h3>${student.name}</h3>

        <p>
            Student ID: ${student.id}
        </p>

        <p>
            Set & Year: ${student.setYear}
        </p>

    `;


    // Show registration message

    message.textContent =
        "Student registered: " + student.name;


    // Remove previous QR

    qrCode.innerHTML = "";


    // Generate student's QR

    new QRCode(qrCode, {

        text: student.id,

        width: 200,

        height: 200

    });

});


// ========================================
// SCAN QR CODE
// ========================================

// ========================================
// SCAN QR CODE
// ========================================

scanButton.addEventListener("click", async function () {

    message.textContent = "Opening camera...";

    const scanner = new Html5Qrcode("scanner");

    try {

        await scanner.start(

            {
                facingMode: "environment"
            },

            {
                fps: 10,
                qrbox: {
                    width: 250,
                    height: 250
                }
            },

            async function (decodedText) {

                console.log(
                    "QR CODE DETECTED:",
                    decodedText
                );

                message.textContent =
                    "QR Code detected!";


                // STOP CAMERA
                try {

                    await scanner.stop();

                } catch (error) {

                    console.log(
                        "Scanner already stopped."
                    );

                }


                // ====================================
                // FIND STUDENT
                // ====================================

                try {

                    const doc =
                        await db
                            .collection("students")
                            .doc(
                                String(decodedText).trim()
                            )
                            .get();


                    // ====================================
                    // STUDENT FOUND
                    // ====================================

                    if (doc.exists) {

                        const student =
                            doc.data();


                        console.log(
                            "STUDENT FOUND:",
                            student
                        );


                        // ====================================
                        // SHOW STUDENT
                        // ====================================

                        studentCard.innerHTML = `

                            <img
                                src="${student.photo || ""}"
                                width="250"
                            >

                            <h3>
                                ${student.name}
                            </h3>

                            <p>
                                Student ID:
                                ${student.id}
                            </p>

                            <p>
                                Set & Year:
                                ${student.setYear}
                            </p>

                            <h3>
                                ✅ PRESENT
                            </h3>

                        `;


                        // ====================================
                        // DATE AND TIME
                        // ====================================

                        const now =
                            new Date();

                        const date =
                            now.toLocaleDateString(
                                "en-PH"
                            );

                        const time =
                            now.toLocaleTimeString(
                                "en-PH"
                            );


                        // ====================================
                        // SAVE ATTENDANCE
                        // ====================================

                        await authReady;


                        await db
                            .collection("attendance")
                            .add({

                                name:
                                    student.name,

                                id:
                                    student.id,

                                setYear:
                                    student.setYear,

                                status:
                                    "PRESENT",

                                date:
                                    date,

                                time:
                                    time,

                                timestamp:
                                    firebase.firestore
                                        .FieldValue
                                        .serverTimestamp()

                            });


                        console.log(
                            "ATTENDANCE SAVED:",
                            student.name
                        );


                        message.textContent =
                            "Attendance recorded for " +
                            student.name;

                    }


                    // ====================================
                    // STUDENT NOT FOUND
                    // ====================================

                    else {

                        console.log(
                            "STUDENT NOT FOUND:",
                            decodedText
                        );


                        studentCard.innerHTML = `

                            <h3>
                                ❌ Student Not Found
                            </h3>

                            <p>
                                Scanned ID:
                                ${decodedText}
                            </p>

                        `;


                        message.textContent =
                            "Student is not registered.";

                    }

                }

                catch (error) {

                    console.error(
                        "FIRESTORE ERROR:",
                        error
                    );


                    message.textContent =
                        "Error connecting to Firebase.";

                }

            },


            function (errorMessage) {

                // Ignore normal scanner messages

            }

        );

    }

    catch (error) {

        console.error(
            "CAMERA ERROR:",
            error
        );


        message.textContent =
            "Camera could not start.";

    }

});

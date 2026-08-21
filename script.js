// =================================
// FIREBASE CONNECTION
// =================================

const firebaseConfig = {
    apiKey: "AIzaSyC9PvfAHE-Eacy4q2LIa25oC0bxHJ9EQOA",
    authDomain: "smed-attendance-system.firebaseapp.com",
    projectId: "smed-attendance-system",
    storageBucket: "smed-attendance-system.firebasestorage.app",
    messagingSenderId: "318678155548",
    appId: "1:318678155548:web:d99b2d6a2b4963fa06fad9"
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

scanButton.addEventListener("click", function () {

    message.textContent = "Opening camera...";


    // Create QR scanner

    const scanner = new Html5Qrcode("scanner");


    scanner.start(

        {
            facingMode: "environment"
        },

        {
            fps: 10,
            qrbox: 250
        },


        // =================================
        // QR CODE SUCCESSFULLY SCANNED
        // =================================

        function (decodedText) {

            message.textContent =
                "QR Code scanned!";


  
// Find student in Firebase using QR / Student ID

db.collection("students")
    .doc(String(decodedText).trim())
    .get()
    .then(function(doc) {

        // Stop camera
        scanner.stop().then(function() {

            if (doc.exists) {

                // Get student from Firebase
                const student = doc.data();

                // Show student information
                studentCard.innerHTML = `
                    <img
                        src="${student.photo}"
                        width="250"
                    >

                    <h3>${student.name}</h3>

                    <p>
                        Student ID:
                        ${student.id}
                    </p>

                    <p>
                        Set & Year:
                        ${student.setYear}
                    </p>

                    <h3>✅ PRESENT</h3>
                `;

                // Create attendance record
                const now = new Date();

                const record = {
                    name: student.name,
                    id: student.id,
                    setYear: student.setYear,
                    status: "PRESENT",
                    date: now.toLocaleDateString(),
                    time: now.toLocaleTimeString()
                };

                // Save attendance locally for now
                attendance.push(record);

                localStorage.setItem(
                    "attendance",
                    JSON.stringify(attendance)
                );

                message.textContent =
                    "Attendance recorded for " +
                    student.name;

            } else {

                studentCard.innerHTML = `
                    <h3>Student Not Found</h3>

                    <p>
                        Scanned ID:
                        ${decodedText}
                    </p>
                `;

                message.textContent =
                    "Student is not registered.";

            }

        });

    })
    .catch(function(error) {

        console.error(
            "Firestore error:",
            error
        );

        message.textContent =
            "Error connecting to Firebase.";

    });


            // Stop camera

            scanner.stop().then(function () {


                // =================================
                // STUDENT FOUND
                // =================================

                if (student) {


                    // Show student's information

                    studentCard.innerHTML = `

                        <img
                            src="${student.photo}"
                            width="250"
                        >

                        <h3>${student.name}</h3>

                        <p>
                            Student ID:
                            ${student.id}
                        </p>

                        <p>
                            Set & Year:
                            ${student.setYear}
                        </p>

                        <h3>✅ PRESENT</h3>

                    `;


                    // =================================
                    // CREATE ATTENDANCE RECORD
                    // =================================

                    const now = new Date();


                    const record = {

                        name: student.name,

                        id: student.id,

                        setYear: student.setYear,

                        status: "PRESENT",

                        date: now.toLocaleDateString(),

                        time: now.toLocaleTimeString()

                    };


                    // Add attendance record

                    attendance.push(record);


                    // Save attendance

                    localStorage.setItem(
                        "attendance",
                        JSON.stringify(attendance)
                    );


                    // Show success message

                    message.textContent =
                        "Attendance recorded for " +
                        student.name;

                }


                // =================================
                // STUDENT NOT FOUND
                // =================================

                else {

                    studentCard.innerHTML = `

                        <h3>Student Not Found</h3>

                        <p>
                            Scanned ID:
                            ${decodedText}
                        </p>

                    `;


                    message.textContent =
                        "Student is not registered.";

                }

            });

        },


        // =================================
        // SCANNER IS STILL SEARCHING
        // =================================

        function (errorMessage) {

            // Do nothing.
            // The camera continues scanning.

        }

    );

});
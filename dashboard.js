// ========================================
// FIREBASE CONFIGURATION
// ========================================

const firebaseConfig = {
  apiKey: "AIzaSyC9PvfAHE-Eacy4q2LIa25oC0bxHJ9EQOA",
  authDomain: "smed-attendance-system.firebaseapp.com",
  projectId: "smed-attendance-system",
  storageBucket: "smed-attendance-system.firebasestorage.app",
  messagingSenderId: "318678155548",
  appId: "1:318678155548:web:5f980fb67de3683406fad9",
  measurementId: "G-C4H5BSNSHZ"
};


// ========================================
// START FIREBASE
// ========================================

firebase.initializeApp(firebaseConfig);

const db =
    firebase.firestore();


// ========================================
// AUTHENTICATION
// ========================================

const authReady =
    firebase
        .auth()
        .signInAnonymously();


// ========================================
// HTML ELEMENTS
// ========================================

const totalStudents =
    document.getElementById("totalStudents");

const presentToday =
    document.getElementById("presentToday");

const absentToday =
    document.getElementById("absentToday");

const attendanceRate =
    document.getElementById("attendanceRate");

const attendanceTable =
    document.getElementById("attendanceTable");

const loading =
    document.getElementById("loading");

const dateFilter =
    document.getElementById("dateFilter");

const refreshButton =
    document.getElementById("refreshButton");


// ========================================
// GET TODAY'S DATE
// ========================================

function getToday() {

    const now = new Date();

    return now.toLocaleDateString("en-PH");

}


// ========================================
// LOAD STUDENTS
// ========================================

async function loadStudents() {

    const snapshot =
        await db
            .collection("students")
            .get();

    return snapshot.size;

}


// ========================================
// LOAD ATTENDANCE
// ========================================

async function loadAttendance() {

    try {

        loading.style.display =
            "block";


        // Wait for Firebase login

        await authReady;


        // Get students

        const studentsSnapshot =
            await db
                .collection("students")
                .get();


        const total =
            studentsSnapshot.size;


        totalStudents.textContent =
            total;


        // Get attendance

        const attendanceSnapshot =
            await db
                .collection("attendance")
                .get();


        let records = [];


        attendanceSnapshot.forEach(
            function(doc) {

                records.push(
                    doc.data()
                );

            }
        );


        // ====================================
        // SELECT DATE
        // ====================================

        let selectedDate =
            getToday();


        if (dateFilter.value) {

            const selected =
                new Date(
                    dateFilter.value +
                    "T00:00:00"
                );


            selectedDate =
                selected.toLocaleDateString(
                    "en-PH"
                );

        }


        // ====================================
        // FILTER BY DATE
        // ====================================

        const todayRecords =
            records.filter(
                function(record) {

                    return (
                        record.date ===
                        selectedDate
                    );

                }
            );


        // ====================================
        // PRESENT
        // ====================================

        const present =
            todayRecords.length;


        presentToday.textContent =
            present;


        // ====================================
        // ABSENT
        // ====================================

        const absent =
            Math.max(
                total - present,
                0
            );


        absentToday.textContent =
            absent;


        // ====================================
        // RATE
        // ====================================

        let rate = 0;


        if (total > 0) {

            rate =
                (
                    present /
                    total
                ) * 100;

        }


        attendanceRate.textContent =
            rate.toFixed(1) + "%";


        // ====================================
        // DISPLAY TABLE
        // ====================================

        attendanceTable.innerHTML =
            "";


        if (todayRecords.length === 0) {

            attendanceTable.innerHTML = `

                <tr>

                    <td
                        colspan="6"
                        style="text-align:center;"
                    >
                        No attendance records
                        for this date.

                    </td>

                </tr>

            `;

        }


        todayRecords.forEach(
            function(record) {

                const row =
                    document.createElement(
                        "tr"
                    );


                row.innerHTML = `

                    <td>
                        ${record.name || ""}
                    </td>

                    <td>
                        ${record.id || ""}
                    </td>

                    <td>
                        ${record.setYear || ""}
                    </td>

                    <td class="present">
                        ✅ ${record.status || "PRESENT"}
                    </td>

                    <td>
                        ${record.date || ""}
                    </td>

                    <td>
                        ${record.time || ""}
                    </td>

                `;


                attendanceTable.appendChild(
                    row
                );

            }
        );


        loading.style.display =
            "none";


    }

    catch (error) {

        console.error(
            "Dashboard error:",
            error
        );


        loading.textContent =
            "Error loading attendance.";

    }

}


// ========================================
// REFRESH BUTTON
// ========================================

refreshButton.addEventListener(
    "click",
    function() {

        loadAttendance();

    }
);


// ========================================
// INITIAL LOAD
// ========================================

loadAttendance();
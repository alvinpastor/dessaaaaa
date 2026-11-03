/* =====================================
   1. LOGIN CREDENTIALS AND STORAGE
===================================== */

const DEMO_USER = 'admin';
const DEMO_PASS = 'admin123';

const STORAGE_KEY = 'registrar_students_v1';

/* =====================================
   2. STUDENT DATA
===================================== */

let students =
    JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null') || [
        {
            id: '2026-0001',
            name: 'Alex Santos',
            program: 'BS Information Systems',
            year: '1st Year',
            email: 'alex.santos@example.com',
            status: 'Enrolled',
            created: Date.now() - 3000
        },
        {
            id: '2026-0002',
            name: 'Jamie Cruz',
            program: 'BS Information Systems',
            year: '1st Year',
            email: 'jamie.cruz@example.com',
            status: 'Pending',
            created: Date.now() - 2000
        },
        {
            id: '2026-0003',
            name: 'Taylor Reyes',
            program: 'BS Business Administration',
            year: '2nd Year',
            email: 'taylor.reyes@example.com',
            status: 'Enrolled',
            created: Date.now() - 1000
        }
    ];

if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

/* =====================================
   3. HELPER FUNCTION
===================================== */

// Get HTML element by ID
const $ = id => document.getElementById(id);

// Save student records
function persist() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    renderAll();
}

// Display notification message
function toast(message) {
    $('toast').textContent = message;
    $('toast').classList.remove('hidden');

    setTimeout(() => {
        $('toast').classList.add('hidden');
    }, 2500);
}

// Prevent HTML injection
function escapeHtml(s) {
    return String(s ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[c]));
}

// Display student enrollment status
function statusPill(status) {
    let cls =
        status === 'Pending' ? 'pending' :
        status === 'Inactive' ? 'inactive' : '';

    return `<span class="pill ${cls}">${escapeHtml(status)}</span>`;
}

/* =====================================
   4. LOGIN AND LOGOUT
===================================== */

// Show the main application
function showApp() {
    $('loginScreen').classList.add('hidden');
    $('app').classList.remove('hidden');

    renderAll();
    showPage('dashboard');
}

// Show login screen
function showLogin() {
    $('app').classList.add('hidden');
    $('loginScreen').classList.remove('hidden');

    $('password').value = '';
    $('loginError').textContent = '';
}

// Login form validation
$('loginForm').addEventListener('submit', e => {
    e.preventDefault();

    if (
        $('username').value.trim() === DEMO_USER &&
        $('password').value === DEMO_PASS
    ) {
        sessionStorage.setItem('registrar_logged_in', 'yes');
        showApp();
    } else {
        $('loginError').textContent =
            'Incorrect username or password. Please try again.';
    }
});

// Logout functionality
$('logoutBtn').addEventListener('click', () => {
    sessionStorage.removeItem('registrar_logged_in');
    showLogin();
});

/* =====================================
   5. PAGE NAVIGATION
===================================== */

function showPage(page) {

    // Show selected page
    ['dashboard', 'students', 'add'].forEach(p => {
        $(p + 'Page').classList.toggle('hidden', p !== page);
    });

    // Update active navigation button
    document.querySelectorAll('.nav-btn[data-page]').forEach(b => {
        b.classList.toggle('active', b.dataset.page === page);
    });

    // Update page title
    $('pageTitle').textContent =
        page === 'dashboard' ? 'Dashboard Overview' :
        page === 'students' ? 'Student Records' :
        'Add Student';

    // Reset form when opening Add Student
    if (page === 'add' && !$('editId').value) {
        resetForm();
    }
}

// Navigation button events
document.querySelectorAll('.nav-btn[data-page]').forEach(b => {
    b.addEventListener('click', () => {
        showPage(b.dataset.page);
    });
});

// View all students
$('viewAllBtn').onclick = () => {
    showPage('students');
};

// Add student button
$('addStudentBtn').onclick = () => {
    resetForm();
    showPage('add');
};

// Cancel student form
$('cancelFormBtn').onclick = () => {
    resetForm();
    showPage('students');
};

/* =====================================
   6. DASHBOARD
===================================== */

function renderAll() {

    // Dashboard statistics
    $('totalStudents').textContent = students.length;

    $('enrolledStudents').textContent =
        students.filter(s => s.status === 'Enrolled').length;

    $('pendingStudents').textContent =
        students.filter(s => s.status === 'Pending').length;

    $('programCount').textContent =
        new Set(
            students
                .map(s => s.program.trim().toLowerCase())
                .filter(Boolean)
        ).size;

    // Display five most recent students
    const recent = [...students]
        .sort((a, b) => b.created - a.created)
        .slice(0, 5);

    $('recentRows').innerHTML = recent.length
        ? recent.map(s => `
            <tr>
                <td>
                    <div class="student-name">
                        ${escapeHtml(s.name)}
                    </div>
                    <div class="student-id">
                        ${escapeHtml(s.id)}
                    </div>
                </td>

                <td>${escapeHtml(s.program)}</td>
                <td>${escapeHtml(s.year)}</td>
                <td>${statusPill(s.status)}</td>
            </tr>
        `).join('')
        : `
            <tr>
                <td colspan="4" class="empty">
                    No student records yet.
                </td>
            </tr>
        `;

    // Refresh student records table
    renderStudentTable();
}

/* =====================================
   7. STUDENT RECORDS AND SEARCH
===================================== */

// Search student records
$('searchInput').addEventListener('input', renderStudentTable);

function renderStudentTable() {

    const q = ($('searchInput')?.value || '').toLowerCase();

    // Filter student records
    const list = students.filter(s =>
        [s.id, s.name, s.program, s.year, s.email, s.status]
            .some(v => String(v).toLowerCase().includes(q))
    );

    // Display filtered records
    $('studentRows').innerHTML = list.map(s => `
        <tr>
            <td>
                <div class="student-name">
                    ${escapeHtml(s.name)}
                </div>
                <div class="student-id">
                    ${escapeHtml(s.id)}
                </div>
            </td>

            <td>${escapeHtml(s.program)}</td>
            <td>${escapeHtml(s.year)}</td>
            <td>${escapeHtml(s.email || '—')}</td>
            <td>${statusPill(s.status)}</td>

            <td>
                <div class="actions">
                    <button
                        class="icon-btn"
                        onclick="editStudent('${encodeURIComponent(s.id)}')"
                        title="Edit"
                    >
                        ✎
                    </button>

                    <button
                        class="icon-btn"
                        onclick="deleteStudent('${encodeURIComponent(s.id)}')"
                        title="Delete"
                    >
                        ×
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    // Display empty message when no records exist
    $('studentEmpty').classList.toggle('hidden', list.length > 0);

    if (!list.length) {
        $('studentRows').innerHTML = '';
    }
}

/* =====================================
   8. ADD AND EDIT STUDENT
===================================== */

// Reset student form
function resetForm() {
    $('studentForm').reset();

    $('editId').value = '';
    $('formTitle').textContent = 'Add new student';
    $('studentId').disabled = false;
}

// Edit existing student
function editStudent(encodedId) {

    const id = decodeURIComponent(encodedId);
    const s = students.find(x => x.id === id);

    if (!s) return;

    $('editId').value = s.id;
    $('studentId').value = s.id;
    $('studentId').disabled = true;

    $('fullName').value = s.name;
    $('program').value = s.program;
    $('yearLevel').value = s.year;
    $('email').value = s.email || '';
    $('status').value = s.status;

    $('formTitle').textContent = 'Edit student record';

    showPage('add');
}

// Submit student form
$('studentForm').addEventListener('submit', e => {
    e.preventDefault();

    const editId = $('editId').value;
    const id = $('studentId').value.trim();

    // Check for duplicate student ID
    if (
        !editId &&
        students.some(s => s.id.toLowerCase() === id.toLowerCase())
    ) {
        alert('That student ID already exists. Please use a unique ID.');
        return;
    }

    // Create student record
    const record = {
        id,
        name: $('fullName').value.trim(),
        program: $('program').value.trim(),
        year: $('yearLevel').value,
        email: $('email').value.trim(),
        status: $('status').value,

        created: editId
            ? (students.find(s => s.id === editId)?.created || Date.now())
            : Date.now()
    };

    // Update or add student
    if (editId) {

        students = students.map(s =>
            s.id === editId ? record : s
        );

        toast('Student record updated.');

    } else {

        students.push(record);

        toast('Student record added.');
    }

    // Save changes
    persist();

    resetForm();
    showPage('students');
});

/* =====================================
   9. DELETE STUDENT
===================================== */

function deleteStudent(encodedId) {

    const id = decodeURIComponent(encodedId);
    const s = students.find(x => x.id === id);

    if (!s) return;

    // Confirm before deleting
    if (
        confirm(`Delete the record for ${s.name}? This cannot be undone.`)
    ) {
        students = students.filter(x => x.id !== id);

        persist();

        toast('Student record deleted.');
    }
}

/* =====================================
   10. CHECK LOGIN SESSION
===================================== */

// Automatically show application if logged in
if (sessionStorage.getItem('registrar_logged_in') === 'yes') {
    showApp();
}


const KEY = "gp_demo_complaints";

// Get complaint details from browser storage
const getItems = () =>
    JSON.parse(localStorage.getItem(KEY) || "[]");

// Save complaint details
const saveItems = items =>
    localStorage.setItem(KEY, JSON.stringify(items));

// Prevent HTML injection when displaying user-entered data
const esc = text =>
    String(text).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]));

// Display current year
document.getElementById("year").textContent =
    new Date().getFullYear();

// Mobile navigation
document.getElementById("menu").onclick = () => {
    document.getElementById("nav").classList.toggle("open");
};

// Service buttons
document.querySelectorAll(".service").forEach(button => {
    button.onclick = () => {
        document.querySelector('[name="category"]').value =
            button.dataset.kind;

        document.getElementById("complaints")
            .scrollIntoView({ behavior: "smooth" });
    };
});

// Complaint registration
document.getElementById("complaintForm").onsubmit = event => {

    event.preventDefault();

    let data = Object.fromEntries(
        new FormData(event.target)
    );

    let reference =
        "GP-" + Math.floor(100000 + Math.random() * 900000);

    let complaints = getItems();

    complaints.unshift({
        ...data,
        ref: reference,
        status: "Submitted",
        date: new Date().toLocaleString()
    });

    saveItems(complaints);

    document.getElementById("formMessage").textContent =
        "Complaint submitted successfully. Your reference number is "
        + reference + ". Save it to track status.";

    event.target.reset();
};

// Complaint tracking
document.getElementById("trackForm").onsubmit = event => {

    event.preventDefault();

    let reference =
        new FormData(event.target)
        .get("reference")
        .trim()
        .toUpperCase();

    let complaint = getItems().find(
        item => item.ref === reference
    );

    let result = document.getElementById("trackResult");

    if (complaint) {

        result.textContent =
            "Category: " + complaint.category +
            " | Status: " + complaint.status +
            " | Submitted: " + complaint.date;

    } else {

        result.textContent =
            "Complaint not found. Check the reference number.";
    }
};

// Admin modal
const modal = document.getElementById("modal");

document.getElementById("adminOpen").onclick = () => {
    modal.classList.add("open");
};

document.getElementById("close").onclick = () => {
    modal.classList.remove("open");
};

modal.onclick = event => {
    if (event.target === modal) {
        modal.classList.remove("open");
    }
};

// Admin login
document.getElementById("loginForm").onsubmit = event => {

    event.preventDefault();

    let password =
        new FormData(event.target).get("password");

    if (password !== "admin123") {

        document.getElementById("loginMessage")
            .textContent = "Incorrect demo password.";

        return;
    }

    document.getElementById("login").hidden = true;

    document.getElementById("dashboard").hidden = false;

    render();
};

// Display complaints in admin dashboard
function render() {

    let complaints = getItems();

    document.getElementById("count").textContent =
        "Total complaints: " + complaints.length;

    let body = document.getElementById("rows");

    body.innerHTML = "";

    if (complaints.length === 0) {

        body.innerHTML =
            "<tr><td colspan='5'>No complaints submitted yet.</td></tr>";

        return;
    }

    complaints.forEach(complaint => {

        let row = document.createElement("tr");

        row.innerHTML = `
            <td>${esc(complaint.ref)}</td>
            <td>${esc(complaint.name)}</td>
            <td>${esc(complaint.category)}</td>
            <td>${esc(complaint.area)}</td>
            <td></td>
        `;

        let select = document.createElement("select");

        let statuses = [
            "Submitted",
            "Under Review",
            "In Progress",
            "Resolved"
        ];

        statuses.forEach(status => {

            let option = document.createElement("option");

            option.textContent = status;

            option.selected =
                complaint.status === status;

            select.appendChild(option);
        });

        select.onchange = () => {

            let allComplaints = getItems();

            let item = allComplaints.find(
                entry => entry.ref === complaint.ref
            );

            item.status = select.value;

            saveItems(allComplaints);

            render();
        };

        row.lastElementChild.appendChild(select);

        body.appendChild(row);
    });
}

// Admin logout
document.getElementById("logout").onclick = () => {

    document.getElementById("login").hidden = false;

    document.getElementById("dashboard").hidden = true;

    modal.classList.remove("open");

    document.getElementById("loginForm").reset();
};

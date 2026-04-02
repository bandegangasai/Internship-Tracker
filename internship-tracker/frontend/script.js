const API_BASE_URL = "/api/internships";
const REFRESH_INTERVAL_MS = 15000;

const state = {
  internships: [],
  filteredInternships: [],
  editingId: null,
  charts: {
    line: null,
    pie: null,
  },
};

const elements = {
  totalCount: document.getElementById("totalCount"),
  appliedCount: document.getElementById("appliedCount"),
  interviewCount: document.getElementById("interviewCount"),
  selectedCount: document.getElementById("selectedCount"),
  rejectedCount: document.getElementById("rejectedCount"),
  tableBody: document.getElementById("internshipTableBody"),
  mobileCards: document.getElementById("mobileCards"),
  emptyState: document.getElementById("emptyState"),
  searchInput: document.getElementById("searchInput"),
  statusFilter: document.getElementById("statusFilter"),
  modal: document.getElementById("internshipModal"),
  modalTitle: document.getElementById("modalTitle"),
  form: document.getElementById("internshipForm"),
  internshipId: document.getElementById("internshipId"),
  companyInput: document.getElementById("companyInput"),
  roleInput: document.getElementById("roleInput"),
  statusInput: document.getElementById("statusInput"),
  appliedDateInput: document.getElementById("appliedDateInput"),
  deadlineInput: document.getElementById("deadlineInput"),
  formMessage: document.getElementById("formMessage"),
  submitButton: document.getElementById("submitButton"),
  openCreateButton: document.getElementById("openCreateButton"),
  closeModalButton: document.getElementById("closeModalButton"),
  cancelButton: document.getElementById("cancelButton"),
  lineChartCanvas: document.getElementById("lineChart"),
  pieChartCanvas: document.getElementById("pieChart"),
};

const formatDate = (value) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatDateForInput = (value) => new Date(value).toISOString().split("T")[0];

const sanitizeText = (value) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const getStatusClass = (status) => `status-${status.toLowerCase()}`;

const showModal = () => {
  elements.modal.classList.remove("hidden");
};

const hideModal = () => {
  elements.modal.classList.add("hidden");
  resetForm();
};

const setFormMessage = (message = "", isError = true) => {
  elements.formMessage.textContent = message;
  elements.formMessage.style.color = isError ? "var(--red)" : "var(--green)";
};

const resetForm = () => {
  state.editingId = null;
  elements.form.reset();
  elements.internshipId.value = "";
  elements.modalTitle.textContent = "Add Internship";
  elements.submitButton.textContent = "Save Internship";
  elements.statusInput.value = "Applied";
  setFormMessage("");
};

const populateForm = (internship) => {
  state.editingId = internship._id;
  elements.internshipId.value = internship._id;
  elements.companyInput.value = internship.company;
  elements.roleInput.value = internship.role;
  elements.statusInput.value = internship.status;
  elements.appliedDateInput.value = formatDateForInput(internship.appliedDate);
  elements.deadlineInput.value = formatDateForInput(internship.deadline);
  elements.modalTitle.textContent = "Edit Internship";
  elements.submitButton.textContent = "Update Internship";
  setFormMessage("");
  showModal();
};

const getStatusCounts = (internships) =>
  internships.reduce(
    (counts, internship) => {
      counts.total += 1;
      counts[internship.status] += 1;
      return counts;
    },
    {
      total: 0,
      Applied: 0,
      Interview: 0,
      Selected: 0,
      Rejected: 0,
    }
  );

const buildTrendData = (internships) => {
  // Group by applied date, then turn that into a cumulative trend line.
  const grouped = internships.reduce((accumulator, internship) => {
    const key = formatDateForInput(internship.appliedDate);
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  const labels = Object.keys(grouped).sort((a, b) => new Date(a) - new Date(b));
  let runningTotal = 0;
  const data = labels.map((label) => {
    runningTotal += grouped[label];
    return runningTotal;
  });

  return {
    labels: labels.map((label) => formatDate(label)),
    data,
  };
};

const renderStats = (internships) => {
  const counts = getStatusCounts(internships);
  elements.totalCount.textContent = counts.total;
  elements.appliedCount.textContent = counts.Applied;
  elements.interviewCount.textContent = counts.Interview;
  elements.selectedCount.textContent = counts.Selected;
  elements.rejectedCount.textContent = counts.Rejected;
};

const renderTable = (internships) => {
  if (internships.length === 0) {
    elements.tableBody.innerHTML = "";
    elements.mobileCards.innerHTML = "";
    elements.emptyState.classList.remove("hidden");
    return;
  }

  elements.emptyState.classList.add("hidden");

  elements.tableBody.innerHTML = internships
    .map(
      (internship) => `
        <tr>
          <td class="company-cell">${sanitizeText(internship.company)}</td>
          <td class="role-cell">${sanitizeText(internship.role)}</td>
          <td>
            <span class="status-badge ${getStatusClass(internship.status)}">
              ${sanitizeText(internship.status)}
            </span>
          </td>
          <td>${formatDate(internship.appliedDate)}</td>
          <td>${formatDate(internship.deadline)}</td>
          <td class="actions-cell">
            <button class="action-button edit" type="button" data-action="edit" data-id="${internship._id}">
              Edit
            </button>
            <button class="action-button delete" type="button" data-action="delete" data-id="${internship._id}">
              Delete
            </button>
          </td>
        </tr>
      `
    )
    .join("");

  elements.mobileCards.innerHTML = internships
    .map(
      (internship) => `
        <article class="mobile-card">
          <h3>${sanitizeText(internship.company)}</h3>
          <p>${sanitizeText(internship.role)}</p>
          <div class="mobile-meta">
            <span class="status-badge ${getStatusClass(internship.status)}">
              ${sanitizeText(internship.status)}
            </span>
            <span>Applied: ${formatDate(internship.appliedDate)}</span>
            <span>Deadline: ${formatDate(internship.deadline)}</span>
          </div>
          <div class="actions-cell">
            <button class="action-button edit" type="button" data-action="edit" data-id="${internship._id}">
              Edit
            </button>
            <button class="action-button delete" type="button" data-action="delete" data-id="${internship._id}">
              Delete
            </button>
          </div>
        </article>
      `
    )
    .join("");
};

const renderCharts = (internships) => {
  const counts = getStatusCounts(internships);
  const trendData = buildTrendData(internships);

  if (state.charts.line) {
    state.charts.line.destroy();
  }

  if (state.charts.pie) {
    state.charts.pie.destroy();
  }

  state.charts.line = new Chart(elements.lineChartCanvas, {
    type: "line",
    data: {
      labels: trendData.labels,
      datasets: [
        {
          label: "Applications over time",
          data: trendData.data,
          fill: true,
          borderColor: "#2563eb",
          backgroundColor: "rgba(37, 99, 235, 0.14)",
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: "#2563eb",
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
          },
        },
      },
    },
  });

  state.charts.pie = new Chart(elements.pieChartCanvas, {
    type: "pie",
    data: {
      labels: ["Applied", "Interview", "Selected", "Rejected"],
      datasets: [
        {
          data: [
            counts.Applied,
            counts.Interview,
            counts.Selected,
            counts.Rejected,
          ],
          backgroundColor: ["#2563eb", "#d97706", "#059669", "#dc2626"],
          borderWidth: 0,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
          labels: {
            usePointStyle: true,
            padding: 18,
          },
        },
      },
    },
  });
};

const applyFilters = () => {
  const query = elements.searchInput.value.trim().toLowerCase();
  const selectedStatus = elements.statusFilter.value;

  state.filteredInternships = state.internships.filter((internship) => {
    const matchesSearch =
      internship.company.toLowerCase().includes(query) ||
      internship.role.toLowerCase().includes(query);
    const matchesStatus =
      selectedStatus === "All" || internship.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  renderTable(state.filteredInternships);
  renderStats(state.filteredInternships);
  renderCharts(state.filteredInternships);
};

const fetchInternships = async () => {
  try {
    const response = await fetch(API_BASE_URL);
    const internships = await response.json();

    if (!response.ok) {
      throw new Error(internships.message || "Failed to fetch internships");
    }

    state.internships = internships;
    applyFilters();
  } catch (error) {
    elements.emptyState.textContent = error.message;
    elements.emptyState.classList.remove("hidden");
  }
};

const submitInternship = async (event) => {
  event.preventDefault();

  const payload = {
    company: elements.companyInput.value.trim(),
    role: elements.roleInput.value.trim(),
    status: elements.statusInput.value,
    appliedDate: elements.appliedDateInput.value,
    deadline: elements.deadlineInput.value,
  };

  if (new Date(payload.deadline) < new Date(payload.appliedDate)) {
    setFormMessage("Deadline cannot be earlier than applied date.");
    return;
  }

  const isEditing = Boolean(state.editingId);
  const endpoint = isEditing
    ? `${API_BASE_URL}/${state.editingId}`
    : API_BASE_URL;
  const method = isEditing ? "PUT" : "POST";

  try {
    setFormMessage(isEditing ? "Updating internship..." : "Saving internship...", false);

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (!response.ok) {
      const message = result.errors?.join(", ") || result.message;
      throw new Error(message || "Request failed");
    }

    hideModal();
    await fetchInternships();
  } catch (error) {
    setFormMessage(error.message);
  }
};

const deleteInternship = async (id) => {
  const shouldDelete = window.confirm(
    "Delete this internship application permanently?"
  );

  if (!shouldDelete) {
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/${id}`, {
      method: "DELETE",
    });
    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Delete failed");
    }

    await fetchInternships();
  } catch (error) {
    window.alert(error.message);
  }
};

const handleActionClick = (event) => {
  const target = event.target.closest("button[data-action]");

  if (!target) {
    return;
  }

  const { action, id } = target.dataset;
  const internship = state.internships.find((item) => item._id === id);

  if (!internship) {
    return;
  }

  if (action === "edit") {
    populateForm(internship);
  }

  if (action === "delete") {
    deleteInternship(id);
  }
};

elements.openCreateButton.addEventListener("click", () => {
  resetForm();
  showModal();
});

elements.closeModalButton.addEventListener("click", hideModal);
elements.cancelButton.addEventListener("click", hideModal);
elements.form.addEventListener("submit", submitInternship);
elements.searchInput.addEventListener("input", applyFilters);
elements.statusFilter.addEventListener("change", applyFilters);
elements.tableBody.addEventListener("click", handleActionClick);
elements.mobileCards.addEventListener("click", handleActionClick);

elements.modal.addEventListener("click", (event) => {
  if (event.target === elements.modal) {
    hideModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !elements.modal.classList.contains("hidden")) {
    hideModal();
  }
});

fetchInternships();
setInterval(fetchInternships, REFRESH_INTERVAL_MS);

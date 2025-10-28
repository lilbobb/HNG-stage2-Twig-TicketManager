let tickets = [];
let editingTicketId = null;
let searchTerm = "";
let statusFilter = "all";
let priorityFilter = "all";
let ticketToDelete = null;

document.addEventListener("DOMContentLoaded", () => {
  loadTickets();
  initializeEventListeners();
});

function initializeEventListeners() {
  const ticketForm = document.getElementById("ticketFormElement");
  if (ticketForm) {
    ticketForm.addEventListener("submit", handleTicketSubmit);
  }

  const toggleBtn = document.getElementById("toggleFormBtn");
  if (toggleBtn) {
    toggleBtn.addEventListener("click", toggleTicketForm);
  }

  const searchInput = document.getElementById("searchInput");
  const statusFilterSelect = document.getElementById("statusFilter");
  const priorityFilterSelect = document.getElementById("priorityFilter");
  const clearFiltersBtn = document.getElementById("clearFilters");

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      searchTerm = e.target.value.toLowerCase();
      filterTickets();
    });
  }

  if (statusFilterSelect) {
    statusFilterSelect.addEventListener("change", (e) => {
      statusFilter = e.target.value;
      filterTickets();
    });
  }

  if (priorityFilterSelect) {
    priorityFilterSelect.addEventListener("change", (e) => {
      priorityFilter = e.target.value;
      filterTickets();
    });
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", () => {
      searchTerm = "";
      statusFilter = "all";
      priorityFilter = "all";
      searchInput.value = "";
      statusFilterSelect.value = "all";
      priorityFilterSelect.value = "all";
      filterTickets();
      showToast("Filters cleared", "success");
    });
  }

  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
  const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
  const deleteModal = document.getElementById("deleteModal");

  if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener("click", confirmDelete);
  }

  if (cancelDeleteBtn) {
    cancelDeleteBtn.addEventListener("click", closeDeleteModal);
  }

  if (deleteModal) {
    deleteModal.addEventListener("click", (e) => {
      if (e.target === deleteModal) closeDeleteModal();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDeleteModal();
  });
}

function toggleTicketForm() {
  const form = document.getElementById("ticketForm");
  const button = document.getElementById("toggleFormBtn");
  if (!form || !button) return;

  const isHidden = form.classList.contains("hidden");
  form.classList.toggle("hidden");

  if (isHidden) {
    button.textContent = "Cancel";
    editingTicketId = null;
    document.getElementById("formTitle").textContent = "Create New Ticket";
    resetTicketForm();
    form.scrollIntoView({ behavior: "smooth" });
  } else {
    button.textContent = "New Ticket";
    editingTicketId = null;
    resetTicketForm();
  }
}

function resetTicketForm() {
  const form = document.getElementById("ticketFormElement");
  if (form) form.reset();
}

function handleTicketSubmit(e) {
  e.preventDefault();
  e.stopPropagation();

  const formData = new FormData(e.target);
  const title = formData.get("title").trim();
  const description = formData.get("description").trim();
  const status = formData.get("status");
  const priority = formData.get("priority");

  if (!title) {
    showToast("Title is required", "error");
    return;
  }
  if (title.length < 3) {
    showToast("Title must be at least 3 characters", "error");
    return;
  }
  if (!["open", "in_progress", "closed"].includes(status)) {
    showToast("Invalid status", "error");
    return;
  }

  if (editingTicketId) {
    const index = tickets.findIndex((t) => t.id === editingTicketId);
    if (index !== -1) {
      tickets[index] = {
        ...tickets[index],
        title,
        description,
        status,
        priority,
      };
      showToast("Ticket updated successfully!", "success");
    }
  } else {
    const newTicket = {
      id: `ticket_${Date.now()}`,
      title,
      description,
      status,
      priority,
      createdAt: new Date().toISOString(),
    };
    tickets.push(newTicket);
    showToast("Ticket created successfully!", "success");
  }

  localStorage.setItem("ticketapp_tickets", JSON.stringify(tickets));
  loadTickets();
  toggleTicketForm();
}

function editTicket(id) {
  const ticket = tickets.find((t) => t.id === id);
  if (!ticket) return;

  editingTicketId = id;
  const form = document.getElementById("ticketForm");
  form.classList.remove("hidden");
  document.getElementById("formTitle").textContent = "Edit Ticket";
  document.getElementById("toggleFormBtn").textContent = "Cancel";

  const formElement = document.getElementById("ticketFormElement");
  formElement.title.value = ticket.title;
  formElement.description.value = ticket.description || "";
  formElement.status.value = ticket.status;
  formElement.priority.value = ticket.priority || "medium";

  form.scrollIntoView({ behavior: "smooth" });
}

function openDeleteModal(id) {
  const ticket = tickets.find((t) => t.id === id);
  if (!ticket) return;

  ticketToDelete = id;
  const modal = document.getElementById("deleteModal");
  const ticketTitle = document.getElementById("deleteTicketTitle");

  if (modal && ticketTitle) {
    ticketTitle.textContent = ticket.title;
    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.getElementById("cancelDeleteBtn").focus();
  }
}

function closeDeleteModal() {
  const modal = document.getElementById("deleteModal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    ticketToDelete = null;
  }
}

function confirmDelete() {
  if (!ticketToDelete) return;

  tickets = tickets.filter((t) => t.id !== ticketToDelete);
  localStorage.setItem("ticketapp_tickets", JSON.stringify(tickets));
  loadTickets();
  closeDeleteModal();
  showToast("Ticket deleted successfully!", "success");
}

function loadTickets() {
  tickets = JSON.parse(localStorage.getItem("ticketapp_tickets") || "[]");
  filterTickets();
}

function filterTickets() {
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      !searchTerm ||
      ticket.title.toLowerCase().includes(searchTerm) ||
      (ticket.description &&
        ticket.description.toLowerCase().includes(searchTerm));

    const matchesStatus =
      statusFilter === "all" || ticket.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || ticket.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  renderTickets(filteredTickets);
}

function renderTickets(ticketsToRender) {
  const container = document.getElementById("ticketsList");
  if (!container) return;

  if (ticketsToRender.length === 0) {
    container.innerHTML = `
            <div class="col-span-full">
                <div class="bg-gray-800 rounded-xl shadow-sm border border-gray-700 text-center py-12">
                    <div class="w-16 h-16 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                        <svg class="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-white mb-2">No tickets found</h3>
                    <p class="text-gray-400">Try adjusting your search or filters</p>
                </div>
            </div>
        `;
    return;
  }

  container.innerHTML = ticketsToRender.map(createTicketCard).join("");
}

function createTicketCard(ticket) {
  const statusColors = {
    open: "bg-green-500/20 text-green-400 border-green-500/30",
    in_progress: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    closed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };
  const priorityColors = {
    high: "bg-red-500/20 text-red-400 border-red-500/30",
    medium: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    low: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  };

  return `
        <div class="bg-gray-800 rounded-xl shadow-sm border border-gray-700 p-6 hover:shadow-lg transition hover:border-gray-600">
            <div class="flex justify-between items-start mb-4">
                <h3 class="text-lg font-semibold text-white flex-1">${escapeHtml(
                  ticket.title
                )}</h3>
                <div class="flex gap-2 ml-3">
                    <button onclick="editTicket('${
                      ticket.id
                    }')" class="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition" title="Edit">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                    </button>
                    <button onclick="openDeleteModal('${
                      ticket.id
                    }')" class="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition" title="Delete">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                    </button>
                </div>
            </div>
            ${
              ticket.description
                ? `<p class="text-sm text-gray-400 mb-4 line-clamp-3">${escapeHtml(
                    ticket.description
                  )}</p>`
                : ""
            }
            <div class="flex flex-wrap gap-2 mb-4">
                <span class="px-2.5 py-1 rounded text-sm font-medium border ${
                  statusColors[ticket.status]
                }">${ticket.status.replace("_", " ")}</span>
                ${
                  ticket.priority
                    ? `<span class="px-2.5 py-1 rounded text-sm font-medium border ${
                        priorityColors[ticket.priority]
                      }">${ticket.priority}</span>`
                    : ""
                }
            </div>
            <div class="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-700">
                <span>Created: ${formatDate(ticket.createdAt)}</span>
                <span class="px-2 py-1 bg-gray-700 text-gray-300 rounded font-medium">${
                  ticket.id
                }</span>
            </div>
        </div>
    `;
}

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

window.editTicket = editTicket;
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;
window.toggleTicketForm = toggleTicketForm;

// AssetFlow Dashboard Application Core Script
(() => {
  const API_BASE = "http://127.0.0.1:8000/api";
  let currentUser = null;

  // Local Storage Fallback Databases for sections not yet backed by API
  const DEFAULT_DEPARTMENTS = [
    { id: 1, name: "Operations" },
    { id: 2, name: "Engineering" },
    { id: 3, name: "Finance" },
    { id: 4, name: "Facilities" }
  ];

  const DEFAULT_CATEGORIES = [
    { id: 1, name: "Laptops & Workstations" },
    { id: 2, name: "Mobile Devices" },
    { id: 3, name: "Office Furniture" },
    { id: 4, name: "Networking Equipment" }
  ];

  const DEFAULT_LOCATIONS = [
    { id: 1, building: "HQ Building", floor: "Floor 1", room: "Room 101" },
    { id: 2, building: "HQ Building", floor: "Floor 2", room: "Room 205" },
    { id: 3, building: "Warehouse A", floor: "Ground", room: "A-4" }
  ];

  const DEFAULT_ASSETS = [
    { id: 1, name: "MacBook Pro 14\"", asset_code: "AF-0421", barcode: "BC-0421", serial_number: "SN893240", category_id: 1, location_id: 1, employee_id: 2, is_shared: false, purchase_date: "2025-01-15", purchase_value: 180000, current_value: 150000, state: "allocated", condition: "good" },
    { id: 2, name: "Epson Projector Pro", asset_code: "AF-0187", barcode: "BC-0187", serial_number: "SNEP801", category_id: 4, location_id: 1, employee_id: null, is_shared: true, purchase_date: "2024-06-10", purchase_value: 45000, current_value: 30000, state: "available", condition: "good" },
    { id: 3, name: "Canon EOS R6 Camera", asset_code: "AF-0733", barcode: "BC-0733", serial_number: "SNCAN09", category_id: 2, location_id: 2, employee_id: 3, is_shared: true, purchase_date: "2025-03-01", purchase_value: 220000, current_value: 210000, state: "allocated", condition: "new" },
    { id: 4, name: "Fleet Vehicle 03", asset_code: "AF-0091", barcode: "BC-0091", serial_number: "SNVEH03", category_id: 3, location_id: 3, employee_id: null, is_shared: false, purchase_date: "2022-11-20", purchase_value: 850000, current_value: 500000, state: "under_maintenance", condition: "fair" }
  ];

  const DEFAULT_BOOKINGS = [
    { id: 1, asset_id: 2, employee_id: 2, employee_name: "Priya Ramanathan", date: "2026-07-15", time_from: "10:00", time_to: "12:00", purpose: "Dept head presentation", state: "confirmed" },
    { id: 2, asset_id: 3, employee_id: 3, employee_name: "John Doe", date: "2026-07-17", time_from: "14:00", time_to: "18:00", purpose: "Product marketing shoot", state: "confirmed" }
  ];

  const DEFAULT_MAINTENANCE = [
    { id: 1, asset_id: 4, requested_by: 2, reporter_name: "Priya Ramanathan", description: "Engine check light is on and oil needs replacement.", priority: "high", assigned_to: null, approved_by: 1, cost: 8500, state: "approved" }
  ];

  const DEFAULT_AUDITS = [
    { id: 1, name: "Q3 Asset Integrity Check", scope_type: "all", auditor_id: 1, start_date: "2026-07-01", deadline: "2026-07-31", state: "in_progress" }
  ];

  const DEFAULT_DISCREPANCIES = [
    { id: 1, cycle_id: 1, asset_id: 1, discrepancy_type: "location_mismatch", expected_value: "Room 101", actual_value: "Room 205", resolution: null, state: "open" }
  ];

  // Default mock pending users requiring approval
  const DEFAULT_PENDING_USERS = [
    { id: 991, username: "a.sharma", email: "a.sharma@company.io", fullname: "Amit Sharma", role: "Employee", department_name: "Engineering" },
    { id: 992, username: "s.nair", email: "s.nair@company.io", fullname: "Siddharth Nair", role: "Asset Manager", department_name: "Operations" }
  ];

  // Helper to get local storage databases
  function getLocalDB(key, defaultData) {
    const val = localStorage.getItem(`db_${key}`);
    if (!val) {
      localStorage.setItem(`db_${key}`, JSON.stringify(defaultData));
      return defaultData;
    }
    return JSON.parse(val);
  }

  function setLocalDB(key, data) {
    localStorage.setItem(`db_${key}`, JSON.stringify(data));
  }

  // Check user session
  function checkSession() {
    const sessionUser = localStorage.getItem("currentUser");
    if (!sessionUser) {
      window.location.href = "./login.html";
      return;
    }
    currentUser = JSON.parse(sessionUser);
    
    // Update badge info
    document.getElementById("sessionName").textContent = currentUser.fullname || currentUser.username;
    document.getElementById("sessionRole").textContent = currentUser.role;
    document.getElementById("avatarLetter").textContent = (currentUser.fullname || currentUser.username).charAt(0).toUpperCase();

    // Toggle Approvals tab display if Admin or Department Head
    const approvalsBtn = document.getElementById("nav-item-approvals");
    if (approvalsBtn) {
      const roleLower = currentUser.role.toLowerCase();
      if (roleLower === "admin" || roleLower === "department head" || roleLower === "dept_head") {
        approvalsBtn.style.display = "flex";
      } else {
        approvalsBtn.style.display = "none";
      }
    }
  }

  // --- Clock ---
  function initClock() {
    const clock = document.getElementById("systemClock");
    if (clock) {
      setInterval(() => {
        const d = new Date();
        clock.textContent = d.toLocaleTimeString('en-US', { hour12: false }) + " IST";
      }, 1000);
    }
  }

  // --- Navigation & Routing ---
  function initNavigation() {
    const navItems = document.querySelectorAll(".nav-item");
    const sections = document.querySelectorAll(".view-section");
    const pageTitle = document.getElementById("activeSectionTitle");

    navItems.forEach(btn => {
      btn.addEventListener("click", () => {
        const target = btn.getAttribute("data-target");

        // UI active classes
        navItems.forEach(n => n.classList.remove("active"));
        sections.forEach(s => s.classList.remove("active"));

        btn.classList.add("active");
        const targetSec = document.getElementById(`view-${target}`);
        if (targetSec) targetSec.classList.add("active");

        // Title update
        const titles = {
          dashboard: "Dashboard Overview",
          assets: "Enterprise Asset Registry",
          bookings: "Shared Resource Bookings",
          maintenance: "Maintenance & Repairs",
          audits: "Asset Verification & Audits",
          approvals: "Account Activations & Approvals"
        };
        if (pageTitle) pageTitle.textContent = titles[target] || "AssetFlow";
        
        // Refresh specific view data
        loadViewData(target);
      });
    });

    document.getElementById("logoutBtn").addEventListener("click", () => {
      localStorage.removeItem("currentUser");
      window.location.href = "./login.html";
    });
  }

  // --- Dynamic Forms Setup ---
  function setupForms() {
    const categories = getLocalDB("categories", DEFAULT_CATEGORIES);
    const locations = getLocalDB("locations", DEFAULT_LOCATIONS);
    const assets = getLocalDB("assets", DEFAULT_ASSETS);
    const audits = getLocalDB("audits", DEFAULT_AUDITS);

    // Categories
    const modalCat = document.getElementById("modalCategorySelect");
    const filterCat = document.getElementById("assetFilterCategory");
    if (modalCat) {
      modalCat.innerHTML = '<option value="" disabled selected>Choose category…</option>' + 
        categories.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    }
    if (filterCat) {
      filterCat.innerHTML = '<option value="">All Categories</option>' + 
        categories.map(c => `<option value="${c.id}">${c.name}</option>`).join("");
    }

    // Locations
    const modalLoc = document.getElementById("modalLocationSelect");
    const auditLoc = document.getElementById("auditLocationSelect");
    const locOptions = locations.map(l => `<option value="${l.id}">${l.building} - ${l.floor} (${l.room})</option>`).join("");
    if (modalLoc) modalLoc.innerHTML = '<option value="" disabled selected>Choose location…</option>' + locOptions;
    if (auditLoc) auditLoc.innerHTML = '<option value="" disabled selected>Select current location…</option>' + locOptions;

    // Shared Assets for Booking dropdown
    const bookingAsset = document.getElementById("bookingAssetSelect");
    if (bookingAsset) {
      const shared = assets.filter(a => a.is_shared);
      bookingAsset.innerHTML = '<option value="" disabled selected>Choose a resource…</option>' + 
        shared.map(a => `<option value="${a.id}">${a.name} (${a.asset_code})</option>`).join("");
    }

    // All Assets for Maintenance / Audit dropdown
    const maintAsset = document.getElementById("maintenanceAssetSelect");
    const auditAsset = document.getElementById("auditAssetSelect");
    const allAssetOptions = assets.map(a => `<option value="${a.id}">${a.name} (${a.asset_code})</option>`).join("");
    if (maintAsset) maintAsset.innerHTML = '<option value="" disabled selected>Choose an asset…</option>' + allAssetOptions;
    if (auditAsset) auditAsset.innerHTML = '<option value="" disabled selected>Select asset to verify…</option>' + allAssetOptions;

    // Active Audit Cycles
    const auditCycle = document.getElementById("auditCycleSelect");
    if (auditCycle) {
      auditCycle.innerHTML = '<option value="" disabled selected>Select active cycle…</option>' + 
        audits.filter(a => a.state === 'in_progress').map(a => `<option value="${a.id}">${a.name}</option>`).join("");
    }
  }

  // --- View Loading Router ---
  function loadViewData(viewName) {
    setupForms();
    switch (viewName) {
      case "dashboard":
        loadDashboardMetrics();
        break;
      case "assets":
        renderAssetsTable();
        break;
      case "bookings":
        renderBookingsTable();
        break;
      case "maintenance":
        renderMaintenanceTable();
        break;
      case "audits":
        renderAuditsAndDiscrepancies();
        break;
      case "approvals":
        renderApprovalsTable();
        break;
    }
  }

  // ================= VIEW: DASHBOARD =================
  let deptChart = null;
  let maintChart = null;

  function loadDashboardMetrics() {
    const assets = getLocalDB("assets", DEFAULT_ASSETS);
    const bookings = getLocalDB("bookings", DEFAULT_BOOKINGS);
    const maintenance = getLocalDB("maintenance", DEFAULT_MAINTENANCE);
    const discrepancies = getLocalDB("discrepancies", DEFAULT_DISCREPANCIES);

    // KPI count
    document.getElementById("cardTotalAssets").textContent = assets.length;
    document.getElementById("cardSharedResources").textContent = assets.filter(a => a.is_shared).length;
    document.getElementById("cardPendingRepairs").textContent = maintenance.filter(m => m.state !== 'done' && m.state !== 'rejected').length;
    document.getElementById("cardOpenAudits").textContent = discrepancies.filter(d => d.state === 'open').length;

    // Build Chart JS
    const ctxDept = document.getElementById("chartDepartment").getContext("2d");
    const ctxMaint = document.getElementById("chartMaintenance").getContext("2d");

    // Count categories
    const categories = getLocalDB("categories", DEFAULT_CATEGORIES);
    const catCounts = categories.map(c => {
      return assets.filter(a => a.category_id === c.id).length;
    });

    if (deptChart) deptChart.destroy();
    deptChart = new Chart(ctxDept, {
      type: 'doughnut',
      data: {
        labels: categories.map(c => c.name),
        datasets: [{
          data: catCounts,
          backgroundColor: ['#2563eb', '#3b82f6', '#10b981', '#f59e0b'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, font: { family: 'Inter' } } }
        }
      }
    });

    // Maintenance Summary
    const states = ['pending_approval', 'approved', 'in_progress', 'done'];
    const stateCounts = states.map(s => {
      return maintenance.filter(m => m.state === s).length;
    });

    if (maintChart) maintChart.destroy();
    maintChart = new Chart(ctxMaint, {
      type: 'bar',
      data: {
        labels: ['Pending Approval', 'Approved', 'In Progress', 'Done'],
        datasets: [{
          label: 'Requests',
          data: stateCounts,
          backgroundColor: '#3b82f6',
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: true, grid: { color: '#eef1f6' }, ticks: { stepSize: 1 } },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // ================= VIEW: ASSETS =================
  function renderAssetsTable() {
    const assets = getLocalDB("assets", DEFAULT_ASSETS);
    const categories = getLocalDB("categories", DEFAULT_CATEGORIES);
    const locations = getLocalDB("locations", DEFAULT_LOCATIONS);
    const tbody = document.getElementById("assetTableBody");

    const searchVal = document.getElementById("assetSearchInput").value.toLowerCase();
    const filterCat = document.getElementById("assetFilterCategory").value;
    const filterState = document.getElementById("assetFilterState").value;

    const filtered = assets.filter(a => {
      const matchSearch = a.name.toLowerCase().includes(searchVal) || 
                          a.asset_code.toLowerCase().includes(searchVal) ||
                          (a.serial_number && a.serial_number.toLowerCase().includes(searchVal)) ||
                          a.barcode.toLowerCase().includes(searchVal);
      const matchCat = !filterCat || a.category_id === parseInt(filterCat, 10);
      const matchState = !filterState || a.state === filterState;
      return matchSearch && matchCat && matchState;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--muted);padding:24px;">No assets match your search/filters.</td></tr>';
      return;
    }

    tbody.innerHTML = filtered.map(a => {
      const cat = categories.find(c => c.id === a.category_id)?.name || "N/A";
      const loc = locations.find(l => l.id === a.location_id);
      const locStr = loc ? `${loc.building} (Fl ${loc.floor.replace(/\D/g, '')})` : "N/A";
      const custodian = a.employee_id === currentUser.id ? "Me" : (a.employee_id ? `User #${a.employee_id}` : "None");
      
      return `
        <tr>
          <td><span style="font-family:'JetBrains Mono',monospace;font-weight:500;">${a.asset_code}</span></td>
          <td style="font-weight:500;color:var(--ink);">${a.name}</td>
          <td>${cat}</td>
          <td>${locStr}</td>
          <td>${custodian}</td>
          <td><span class="badge badge--${a.condition}">${a.condition}</span></td>
          <td><span class="badge badge--${a.state}">${a.state.replace('_', ' ')}</span></td>
          <td>
            ${a.state === 'available' ? `<button class="btn btn--secondary btn--sm" onclick="allocateAsset(${a.id})">Allocate</button>` : ''}
            <button class="btn btn--danger btn--sm" onclick="retireAsset(${a.id})">Dispose</button>
          </td>
        </tr>
      `;
    }).join("");
  }

  // Allocate Asset Action
  window.allocateAsset = (id) => {
    const assets = getLocalDB("assets", DEFAULT_ASSETS);
    const asset = assets.find(a => a.id === id);
    if (!asset) return;

    if (asset.state !== 'available') {
      alert("This asset is already allocated or unavailable!");
      return;
    }

    const empId = prompt("Enter Employee ID to allocate to (or cancel):", currentUser.id);
    if (!empId) return;

    asset.state = "allocated";
    asset.employee_id = parseInt(empId, 10);
    setLocalDB("assets", assets);
    renderAssetsTable();
    loadDashboardMetrics();
  };

  // Dispose Asset Action
  window.retireAsset = (id) => {
    if (!confirm("Are you sure you want to retire and dispose of this asset?")) return;
    const assets = getLocalDB("assets", DEFAULT_ASSETS);
    const asset = assets.find(a => a.id === id);
    if (!asset) return;

    asset.state = "disposed";
    asset.employee_id = null;
    setLocalDB("assets", assets);
    renderAssetsTable();
    loadDashboardMetrics();
  };

  // Register Asset Form Submission
  document.getElementById("btnRegisterAsset").addEventListener("click", () => {
    document.getElementById("registerAssetModal").classList.add("open");
  });

  document.getElementById("registerAssetForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const assets = getLocalDB("assets", DEFAULT_ASSETS);
    const fd = new FormData(e.target);

    const newAsset = {
      id: assets.length > 0 ? Math.max(...assets.map(a => a.id)) + 1 : 1,
      name: fd.get("name"),
      asset_code: fd.get("asset_code"),
      barcode: fd.get("barcode"),
      serial_number: fd.get("serial_number") || null,
      category_id: parseInt(fd.get("category_id"), 10),
      location_id: parseInt(fd.get("location_id"), 10),
      employee_id: null,
      is_shared: fd.get("is_shared") === "on",
      purchase_date: fd.get("purchase_date"),
      purchase_value: parseFloat(fd.get("purchase_value")),
      current_value: parseFloat(fd.get("purchase_value")),
      useful_life_months: parseInt(fd.get("useful_life_months"), 10),
      depreciation_method: fd.get("depreciation_method"),
      state: "available",
      condition: "new"
    };

    // Check duplicate code / barcode
    if (assets.some(a => a.asset_code === newAsset.asset_code || a.barcode === newAsset.barcode)) {
      alert("An asset with this Asset Code or Barcode already exists!");
      return;
    }

    assets.push(newAsset);
    setLocalDB("assets", assets);
    e.target.reset();
    document.getElementById("registerAssetModal").classList.remove("open");
    renderAssetsTable();
    loadDashboardMetrics();
  });

  // Filters Events
  document.getElementById("assetSearchInput").addEventListener("input", renderAssetsTable);
  document.getElementById("assetFilterCategory").addEventListener("change", renderAssetsTable);
  document.getElementById("assetFilterState").addEventListener("change", renderAssetsTable);

  // ================= VIEW: BOOKINGS =================
  function renderBookingsTable() {
    const bookings = getLocalDB("bookings", DEFAULT_BOOKINGS);
    const assets = getLocalDB("assets", DEFAULT_ASSETS);
    const tbody = document.getElementById("bookingTableBody");

    if (bookings.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:24px;">No bookings found.</td></tr>';
      return;
    }

    tbody.innerHTML = bookings.map(b => {
      const asset = assets.find(a => a.id === b.asset_id)?.name || "N/A";
      const statusClass = b.state === 'confirmed' ? 'available' : b.state === 'pending' ? 'draft' : 'disposed';
      
      return `
        <tr>
          <td style="font-weight:500;color:var(--ink);">${asset}</td>
          <td>${b.employee_name} (ID: ${b.employee_id})</td>
          <td style="font-family:monospace;">${b.date}</td>
          <td style="font-family:monospace;">${b.time_from} - ${b.time_to}</td>
          <td>${b.purpose || 'None'}</td>
          <td><span class="badge badge--${statusClass}">${b.state}</span></td>
        </tr>
      `;
    }).join("");
  }

  // Real-time booking overlap warning check
  const bookForm = document.getElementById("bookingForm");
  if (bookForm) {
    const timeFields = ["bookingAssetSelect", "bookingDate", "bookingTimeFrom", "bookingTimeTo"];
    timeFields.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("change", checkBookingOverlap);
    });
  }

  function checkBookingOverlap() {
    const assetId = document.getElementById("bookingAssetSelect").value;
    const date = document.getElementById("bookingDate").value;
    const timeFrom = document.getElementById("bookingTimeFrom").value;
    const timeTo = document.getElementById("bookingTimeTo").value;
    const msgDiv = document.getElementById("bookingCheckMsg");

    if (!assetId || !date || !timeFrom || !timeTo) {
      if (msgDiv) msgDiv.textContent = "";
      return;
    }

    const bookings = getLocalDB("bookings", DEFAULT_BOOKINGS);
    
    // Check overlap
    const hasOverlap = bookings.some(b => {
      if (b.asset_id !== parseInt(assetId, 10) || b.date !== date || b.state !== "confirmed") return false;
      return (timeFrom <= b.time_from && timeTo > b.time_from) || 
             (timeFrom < b.time_to && timeTo >= b.time_to) ||
             (b.time_from <= timeFrom && b.time_to > timeFrom);
    });

    if (hasOverlap) {
      if (msgDiv) {
        msgDiv.textContent = "⚠ Time slot overlaps with an existing booking!";
        msgDiv.style.color = "#ef4444";
      }
      document.getElementById("btnSubmitBooking").disabled = true;
    } else {
      if (msgDiv) {
        msgDiv.textContent = "✓ Time slot is available.";
        msgDiv.style.color = "#10b981";
      }
      document.getElementById("btnSubmitBooking").disabled = false;
    }
  }

  if (bookForm) {
    bookForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const bookings = getLocalDB("bookings", DEFAULT_BOOKINGS);
      const fd = new FormData(e.target);

      const newBooking = {
        id: bookings.length > 0 ? Math.max(...bookings.map(b => b.id)) + 1 : 1,
        asset_id: parseInt(fd.get("asset_id"), 10),
        employee_id: currentUser.id,
        employee_name: currentUser.fullname || currentUser.username,
        date: fd.get("date"),
        time_from: fd.get("time_from"),
        time_to: fd.get("time_to"),
        purpose: fd.get("purpose") || null,
        state: "confirmed"
      };

      bookings.push(newBooking);
      setLocalDB("bookings", bookings);
      e.target.reset();
      document.getElementById("bookingCheckMsg").textContent = "";
      renderBookingsTable();
      loadDashboardMetrics();
    });
  }

  // ================= VIEW: MAINTENANCE =================
  function renderMaintenanceTable() {
    const maintenance = getLocalDB("maintenance", DEFAULT_MAINTENANCE);
    const assets = getLocalDB("assets", DEFAULT_ASSETS);
    const tbody = document.getElementById("maintenanceTableBody");

    if (maintenance.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:24px;">No requests found.</td></tr>';
      return;
    }

    tbody.innerHTML = maintenance.map(m => {
      const asset = assets.find(a => a.id === m.asset_id);
      const assetStr = asset ? `${asset.name} (${asset.asset_code})` : "N/A";
      const statusClass = m.state === 'approved' ? 'available' : m.state === 'in_progress' ? 'allocated' : m.state === 'done' ? 'available' : 'draft';
      
      const showActions = currentUser.role.toLowerCase() === 'admin' || currentUser.role.toLowerCase() === 'asset manager';
      
      return `
        <tr>
          <td style="font-weight:500;color:var(--ink);">${assetStr}</td>
          <td><span class="badge badge--${m.priority === 'critical' || m.priority === 'high' ? 'disposed' : 'draft'}">${m.priority}</span></td>
          <td>${m.reporter_name}</td>
          <td style="font-family:monospace;">₹${m.cost.toFixed(2)}</td>
          <td><span class="badge badge--${statusClass}">${m.state.replace('_', ' ')}</span></td>
          <td>
            ${showActions && m.state === 'pending_approval' ? `<button class="btn btn--primary btn--sm" onclick="approveMaintenance(${m.id})">Approve</button>` : ''}
            ${showActions && m.state === 'approved' ? `<button class="btn btn--secondary btn--sm" onclick="startMaintenance(${m.id})">Start Work</button>` : ''}
            ${m.state === 'in_progress' ? `<button class="btn btn--sm btn--primary" onclick="resolveMaintenance(${m.id})">Resolve</button>` : ''}
          </td>
        </tr>
      `;
    }).join("");
  }

  // Maintenance Actions
  window.approveMaintenance = (id) => {
    const maintenance = getLocalDB("maintenance", DEFAULT_MAINTENANCE);
    const req = maintenance.find(m => m.id === id);
    if (!req) return;

    req.state = "approved";
    req.approved_by = currentUser.id;
    setLocalDB("maintenance", maintenance);

    // Also update asset state
    const assets = getLocalDB("assets", DEFAULT_ASSETS);
    const asset = assets.find(a => a.id === req.asset_id);
    if (asset) asset.state = "under_maintenance";
    setLocalDB("assets", assets);

    renderMaintenanceTable();
    loadDashboardMetrics();
  };

  window.startMaintenance = (id) => {
    const maintenance = getLocalDB("maintenance", DEFAULT_MAINTENANCE);
    const req = maintenance.find(m => m.id === id);
    if (!req) return;

    req.state = "in_progress";
    setLocalDB("maintenance", maintenance);
    renderMaintenanceTable();
  };

  window.resolveMaintenance = (id) => {
    const cost = prompt("Enter maintenance cost (INR):", "0");
    if (cost === null) return;
    const res = prompt("Enter resolution notes:", "Replaced broken part");
    if (!res) return;

    const maintenance = getLocalDB("maintenance", DEFAULT_MAINTENANCE);
    const req = maintenance.find(m => m.id === id);
    if (!req) return;

    req.state = "done";
    req.cost = parseFloat(cost) || 0.00;
    req.resolution = res;
    setLocalDB("maintenance", maintenance);

    // Release asset
    const assets = getLocalDB("assets", DEFAULT_ASSETS);
    const asset = assets.find(a => a.id === req.asset_id);
    if (asset) {
      asset.state = "available";
      asset.condition = "good";
    }
    setLocalDB("assets", assets);

    renderMaintenanceTable();
    loadDashboardMetrics();
  };

  document.getElementById("maintenanceForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const maintenance = getLocalDB("maintenance", DEFAULT_MAINTENANCE);
    const fd = new FormData(e.target);

    const newReq = {
      id: maintenance.length > 0 ? Math.max(...maintenance.map(m => m.id)) + 1 : 1,
      asset_id: parseInt(fd.get("asset_id"), 10),
      requested_by: currentUser.id,
      reporter_name: currentUser.fullname || currentUser.username,
      description: fd.get("description"),
      priority: fd.get("priority"),
      assigned_to: null,
      approved_by: null,
      cost: 0.00,
      resolution: null,
      state: "pending_approval"
    };

    maintenance.push(newReq);
    setLocalDB("maintenance", maintenance);
    e.target.reset();
    renderMaintenanceTable();
    loadDashboardMetrics();
  });

  // ================= VIEW: AUDITS =================
  function renderAuditsAndDiscrepancies() {
    const discrepancies = getLocalDB("discrepancies", DEFAULT_DISCREPANCIES);
    const assets = getLocalDB("assets", DEFAULT_ASSETS);
    const tbody = document.getElementById("discrepancyTableBody");

    if (discrepancies.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--muted);padding:24px;">No discrepancies logged.</td></tr>';
      return;
    }

    tbody.innerHTML = discrepancies.map(d => {
      const asset = assets.find(a => a.id === d.asset_id);
      const assetStr = asset ? `${asset.name} (${asset.asset_code})` : "N/A";
      const statusClass = d.state === 'resolved' ? 'available' : 'disposed';
      
      return `
        <tr>
          <td style="font-weight:500;color:var(--ink);">${assetStr}</td>
          <td><span style="font-weight:500;color:#d92d20;">${d.discrepancy_type.replace('_', ' ')}</span></td>
          <td>${d.expected_value}</td>
          <td>${d.actual_value}</td>
          <td><span class="badge badge--${statusClass}">${d.state}</span></td>
        </tr>
      `;
    }).join("");
  }

  document.getElementById("auditVerifyForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const discrepancies = getLocalDB("discrepancies", DEFAULT_DISCREPANCIES);
    const assets = getLocalDB("assets", DEFAULT_ASSETS);
    const locations = getLocalDB("locations", DEFAULT_LOCATIONS);
    const fd = new FormData(e.target);

    const cycleId = parseInt(fd.get("cycle_id"), 10);
    const assetId = parseInt(fd.get("asset_id"), 10);
    const isFound = fd.get("is_found") === "1";
    const condition = fd.get("condition");
    const locId = parseInt(fd.get("location_id"), 10);

    const asset = assets.find(a => a.id === assetId);
    if (!asset) return;

    // Discrepancy checks
    let logged = false;

    if (!isFound) {
      discrepancies.push({
        id: discrepancies.length > 0 ? Math.max(...discrepancies.map(d => d.id)) + 1 : 1,
        cycle_id: cycleId,
        asset_id: assetId,
        discrepancy_type: "missing",
        expected_value: "Present",
        actual_value: "Missing",
        resolution: null,
        state: "open"
      });
      asset.state = "disposed";
      logged = true;
    } else {
      // Check location mismatch
      if (asset.location_id !== locId) {
        const expectedLoc = locations.find(l => l.id === asset.location_id);
        const actualLoc = locations.find(l => l.id === locId);
        
        discrepancies.push({
          id: discrepancies.length > 0 ? Math.max(...discrepancies.map(d => d.id)) + 1 : 1,
          cycle_id: cycleId,
          asset_id: assetId,
          discrepancy_type: "location_mismatch",
          expected_value: expectedLoc ? `${expectedLoc.building} ${expectedLoc.room}` : 'Unknown',
          actual_value: actualLoc ? `${actualLoc.building} ${actualLoc.room}` : 'Unknown',
          resolution: null,
          state: "open"
        });
        asset.location_id = locId;
        logged = true;
      }

      // Check condition mismatch
      if (asset.condition !== condition) {
        discrepancies.push({
          id: discrepancies.length > 0 ? Math.max(...discrepancies.map(d => d.id)) + 1 : 1,
          cycle_id: cycleId,
          asset_id: assetId,
          discrepancy_type: "condition_mismatch",
          expected_value: asset.condition,
          actual_value: condition,
          resolution: null,
          state: "open"
        });
        asset.condition = condition;
        logged = true;
      }
    }

    setLocalDB("assets", assets);
    setLocalDB("discrepancies", discrepancies);
    e.target.reset();
    
    if (logged) {
      alert("Verification complete: Discrepancy detected and automatically logged!");
    } else {
      alert("Verification complete: Asset verified successfully, no discrepancies!");
    }

    renderAuditsAndDiscrepancies();
    loadDashboardMetrics();
  });

  // ================= VIEW: APPROVALS =================
  async function renderApprovalsTable() {
    const tbody = document.getElementById("approvalsTableBody");
    if (!tbody) return;

    try {
      // Request pending users from the real API backend
      const response = await fetch(`${API_BASE}/users/pending?role=${currentUser.role}&department_id=${currentUser.department_id || ''}`);
      if (!response.ok) {
        throw new Error("API not fully configured or returned error");
      }

      const pendingUsers = await response.json();
      setLocalDB("pending_users", pendingUsers); // cache locally

      if (pendingUsers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:24px;">No pending account activations.</td></tr>';
        return;
      }

      renderApprovalsListHTML(pendingUsers);

    } catch (err) {
      console.warn("Falling back to local mock pending database:", err.message);
      // Fallback to local DB mock pending users
      const pendingUsers = getLocalDB("pending_users", DEFAULT_PENDING_USERS);
      
      // Filter by department head's department if they are a department head
      const roleLower = currentUser.role.toLowerCase();
      let filtered = pendingUsers;
      if ((roleLower === "department head" || roleLower === "dept_head") && currentUser.department_id) {
        // Mock departments mapper
        const depts = { 1: "Operations", 2: "Engineering", 3: "Finance", 4: "Facilities" };
        const myDeptName = depts[currentUser.department_id];
        filtered = pendingUsers.filter(u => u.department_name === myDeptName);
      }

      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--muted);padding:24px;">No pending account activations.</td></tr>';
        return;
      }

      renderApprovalsListHTML(filtered);
    }
  }

  function renderApprovalsListHTML(usersList) {
    const tbody = document.getElementById("approvalsTableBody");
    tbody.innerHTML = usersList.map(u => {
      return `
        <tr>
          <td style="font-weight:500;color:var(--ink);">${u.fullname}</td>
          <td style="font-family:'JetBrains Mono',monospace;">${u.username}</td>
          <td>${u.email}</td>
          <td><span class="badge badge--allocated">${u.role.replace('_', ' ')}</span></td>
          <td>${u.department_name || 'None'}</td>
          <td>
            <button class="btn btn--primary btn--sm" onclick="approveAccount(${u.id})">Approve & Activate</button>
          </td>
        </tr>
      `;
    }).join("");
  }

  // Approve Account Action
  window.approveAccount = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/users/approve/${id}`, { method: "POST" });
      if (!response.ok) {
        throw new Error("Approval endpoint not found or failed");
      }

      const res = await response.json();
      alert(res.message || "Account activated!");
      renderApprovalsTable();

    } catch (err) {
      console.warn("Approve account fallback local DB trigger:", err.message);
      // Local fallback approval
      let pending = getLocalDB("pending_users", DEFAULT_PENDING_USERS);
      pending = pending.filter(u => u.id !== id);
      setLocalDB("pending_users", pending);
      alert("Success: Account approved and activated! (Local DB Update)");
      renderApprovalsTable();
    }
  };

  // --- Initialize App ---
  document.addEventListener("DOMContentLoaded", () => {
    checkSession();
    initClock();
    initNavigation();
    loadViewData("dashboard");
  });
})();

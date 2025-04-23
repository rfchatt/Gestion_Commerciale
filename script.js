// Initialization
const { jsPDF } = window.jspdf;

// Global variables
let currentDate = new Date();
currentDate.setHours(0, 0, 0, 0);
let allData = JSON.parse(localStorage.getItem("commercialData")) || {};
let products = [];
let credits = [];

// Utility functions
function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

function formatDateForDisplay(date) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("fr-FR", options);
}

// Margin calculation functions
function calculateMargin() {
  // Récupération des valeurs
  const yesterdayCash =
    parseFloat(document.getElementById("yesterdayCash").value) || 0;
  const todayCash =
    parseFloat(document.getElementById("todayCash").value) || 0;
  const yesterdayDeler =
    parseFloat(document.getElementById("yesterdayDeler").value) || 0;

  // Recharges
  const inwiRecharge =
    parseFloat(document.getElementById("inwiRecharge").value) || 0;
  const orangeRecharge =
    parseFloat(document.getElementById("orangeRecharge").value) || 0;
  const iamRecharge =
    parseFloat(document.getElementById("iamRecharge").value) || 0;
  const totalRecharges = inwiRecharge + orangeRecharge + iamRecharge;

  // Restes Deler
  const remainingInwi =
    parseFloat(document.getElementById("remainingInwi").value) || 0;
  const remainingOrange =
    parseFloat(document.getElementById("remainingOrange").value) || 0;
  const remainingIAM =
    parseFloat(document.getElementById("remainingIAM").value) || 0;
  const totalRemaining = remainingInwi + remainingOrange + remainingIAM;
  const remainingCashe =
    parseFloat(document.getElementById("remainingCashe").value) || 0;

  // Statistiques
  const totalSales =
    parseFloat(
      document.getElementById("totalSales").textContent.replace(" DH", "")
    ) || 0;
  const pendingCredits =
    parseFloat(
      document
        .getElementById("pendingCredits")
        .textContent.replace(" DH", "")
    ) || 0;

  // Calcul avec inversion du signe
  const margin =
    -1 *
    (yesterdayDeler +
      totalRecharges -
      totalRemaining +
      totalSales -
      pendingCredits -
      todayCash +
      yesterdayCash) + remainingCashe;

  // Affichage
  document.getElementById("marginResult").textContent =
    margin.toFixed(2) + " DH";

  // Sauvegarde
  saveMarginData({
    yesterdayCash,
    todayCash,
    yesterdayDeler,
    recharges: {
      inwi: inwiRecharge,
      orange: orangeRecharge,
      iam: iamRecharge,
      total: totalRecharges,
    },
    remaining: {
      inwi: remainingInwi,
      orange: remainingOrange,
      iam: remainingIAM,
      total: totalRemaining,
    },
    totalSales,
    pendingCredits,
    margin,
    remainingCashe
  });
}

function saveMarginData(data) {
  const dateKey = formatDate(currentDate);
  if (!allData[dateKey]) {
    allData[dateKey] = {};
  }
  allData[dateKey].marginData = data;
  localStorage.setItem("commercialData", JSON.stringify(allData));
}

function loadMarginData() {
  const dateKey = formatDate(currentDate);
  if (allData[dateKey] && allData[dateKey].marginData) {
    const marginData = allData[dateKey].marginData;
    document.getElementById("yesterdayCash").value =
      marginData.yesterdayCash;
    document.getElementById("todayCash").value = marginData.todayCash;
    document.getElementById("yesterdayDeler").value =
      marginData.yesterdayDeler;
    document.getElementById("inwiRecharge").value =
      marginData.recharges.inwi;
    document.getElementById("orangeRecharge").value =
      marginData.recharges.orange;
    document.getElementById("iamRecharge").value =
      marginData.recharges.iam;
    document.getElementById("remainingInwi").value =
      marginData.remaining.inwi;
    document.getElementById("remainingOrange").value =
      marginData.remaining.orange;
    document.getElementById("remainingIAM").value =
      marginData.remaining.iam;
    document.getElementById("remainingCashe").value =
      marginData.remainingCashe;
    document.getElementById("marginResult").textContent =
      marginData.margin.toFixed(2) + " DH";
  }
}

function resetMarginInputs() {
  document.getElementById("yesterdayCash").value = "";
  document.getElementById("todayCash").value = "";
  document.getElementById("yesterdayDeler").value = "";
  document.getElementById("inwiRecharge").value = "";
  document.getElementById("orangeRecharge").value = "";
  document.getElementById("iamRecharge").value = "";
  document.getElementById("remainingInwi").value = "";
  document.getElementById("remainingOrange").value = "";
  document.getElementById("remainingIAM").value = "";
  document.getElementById("remainingCashe").value = "";
  document.getElementById("marginResult").textContent = "0.00 DH";
}

// Main data functions
function loadDayData(date) {
  currentDate = date;
  updateDateDisplay();

  const dateKey = formatDate(date);
  if (!allData[dateKey]) {
    allData[dateKey] = {
      products: [],
      credits: [],
      marginData: null,
    };
  }

  // Reset margin fields when changing days
  resetMarginInputs();

  products = allData[dateKey].products || [];
  credits = allData[dateKey].credits || [];

  renderProducts();
  renderCredits();
  updateStats();
  loadMarginData();
}

function changeDay(days) {
  const newDate = new Date(currentDate);
  newDate.setDate(newDate.getDate() + days);
  loadDayData(newDate);
}

function updateDateDisplay() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Update displayed date
  const dayDisplay = document.getElementById("currentDayDisplay");
  dayDisplay.textContent = formatDateForDisplay(currentDate);

  // Update system date
  document.getElementById("currentDate").textContent =
    "Système: " + formatDate(currentDate);

  // Highlight if today
  if (currentDate.getTime() === today.getTime()) {
    dayDisplay.classList.add("today-highlight");
  } else {
    dayDisplay.classList.remove("today-highlight");
  }
}

function saveData() {
  const dateKey = formatDate(currentDate);
  allData[dateKey] = {
    products: products,
    credits: credits,
  };

  localStorage.setItem("commercialData", JSON.stringify(allData));
  document.getElementById("backupStatus").textContent =
    "Données mises à jour - " + new Date().toLocaleTimeString();
}

// Product functions
function renderProducts() {
  const productList = document.getElementById("productList");

  if (products.length === 0) {
    productList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-box-open"></i>
        <p>Aucun produit enregistré</p>
      </div>
    `;
    return;
  }

  productList.innerHTML = "";

  products.forEach((product) => {
    const item = document.createElement("div");
    item.className = "item";
    item.innerHTML = `
      <div class="item-info">
        <div class="item-name">${product.name}</div>
        <div class="item-details">${
          product.price
        } DH - ${formatDate(new Date(product.date))}</div>
      </div>
      <div class="item-actions">
        <button class="btn-danger" data-id="${
          product.id
        }" data-type="product">
          <i class="fas fa-trash-alt"></i> Supprimer
        </button>
      </div>
    `;
    productList.appendChild(item);
  });
}

function deleteProduct(id) {
  if (confirm("Supprimer ce produit ?")) {
    products = products.filter((p) => p.id !== id);
    saveData();
    renderProducts();
    updateStats();
  }
}

// Credit functions
function renderCredits() {
  const creditList = document.getElementById("creditList");

  if (credits.length === 0) {
    creditList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-hand-holding-usd"></i>
        <p>Aucun crédit enregistré</p>
      </div>
    `;
    return;
  }

  creditList.innerHTML = "";

  credits.forEach((credit) => {
    const item = document.createElement("div");
    item.className = "item";
    item.innerHTML = `
      <div class="item-info">
        <div class="item-name">${credit.borrower} - ${
      credit.type
    }</div>
        <div class="item-details">${
          credit.amount
        } DH - ${formatDate(new Date(credit.date))}</div>
      </div>
      <div class="item-actions">
        <button class="${
          credit.paid ? "btn-warning" : "btn-success"
        }" 
                data-id="${
                  credit.id
                }" data-type="credit" data-action="toggle">
          <i class="fas fa-${
            credit.paid ? "undo" : "check"
          }"></i> ${
      credit.paid ? "Marquer impayé" : "Marquer payé"
    }
        </button>
        <button class="btn-danger" data-id="${
          credit.id
        }" data-type="credit" data-action="delete">
          <i class="fas fa-trash-alt"></i> Supprimer
        </button>
      </div>
      <span class="badge ${
        credit.paid ? "badge-paid" : "badge-pending"
      }">
        <i class="fas fa-${
          credit.paid ? "check-circle" : "exclamation-circle"
        }"></i> ${credit.paid ? "Payé" : "Impayé"}
      </span>
    `;
    creditList.appendChild(item);
  });
}

function toggleCreditStatus(id) {
  credits = credits.map((c) => {
    if (c.id === id) {
      return { ...c, paid: !c.paid };
    }
    return c;
  });
  saveData();
  renderCredits();
  updateStats();
}

function deleteCredit(id) {
  if (confirm("Supprimer ce crédit ?")) {
    credits = credits.filter((c) => c.id !== id);
    saveData();
    renderCredits();
    updateStats();
  }
}

// Stats functions
function updateStats() {
  // Sales
  const totalSales = products.reduce(
    (sum, p) => sum + parseFloat(p.price),
    0
  );
  document.getElementById("totalSales").textContent =
    totalSales.toFixed(2) + " DH";

  // Credits
  const totalCredits = credits.reduce(
    (sum, c) => sum + parseFloat(c.amount),
    0
  );
  const pendingCredits = credits.reduce(
    (sum, c) => (!c.paid ? sum + parseFloat(c.amount) : sum),
    0
  );

  document.getElementById("totalCredits").textContent =
    totalCredits.toFixed(2) + " DH";
  document.getElementById("pendingCredits").textContent =
    pendingCredits.toFixed(2) + " DH";
}

// PDF Export function
function exportToPDF() {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.setTextColor(40);
  doc.text(
    "Rapport Commercial - " + formatDateForDisplay(currentDate),
    105,
    15,
    { align: "center" }
  );

  doc.setFontSize(12);
  doc.setTextColor(100);
  doc.text(`Généré le: ${formatDate(new Date())}`, 105, 22, {
    align: "center",
  });

  // Sales section
  doc.setFontSize(14);
  doc.setTextColor(40);
  doc.text("Détail des Ventes", 14, 35);

  const ventesData = products.map((p) => [
    p.name,
    `${p.price} DH`,
    formatDate(new Date(p.date)),
  ]);

  doc.autoTable({
    head: [["Produit", "Prix", "Date"]],
    body: ventesData,
    startY: 40,
    theme: "grid",
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 40 },
  });

  // Credits section
  doc.setFontSize(14);
  doc.text("Détail des Crédits", 14, doc.autoTable.previous.finalY + 20);

  const creditsData = credits.map((c) => [
    c.borrower,
    c.type,
    `${c.amount} DH`,
    c.paid ? "Payé" : "Impayé",
    formatDate(new Date(c.date)),
  ]);

  doc.autoTable({
    head: [["Client", "Type", "Montant", "Statut", "Date"]],
    body: creditsData,
    startY: doc.autoTable.previous.finalY + 25,
    theme: "grid",
    headStyles: {
      fillColor: [142, 68, 173],
      textColor: 255,
      fontStyle: "bold",
    },
    columnStyles: {
      3: { cellWidth: "auto", halign: "center" },
    },
    didDrawCell: (data) => {
      if (data.column.index === 3 && data.cell.raw === "Impayé") {
        doc.setTextColor(231, 76, 60);
      } else if (data.column.index === 3 && data.cell.raw === "Payé") {
        doc.setTextColor(39, 174, 96);
      }
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
  });

  // Stats section
  doc.setFontSize(14);
  doc.text(
    "Statistiques Globales",
    14,
    doc.autoTable.previous.finalY + 20
  );

  const totalVentes = products.reduce(
    (sum, p) => sum + parseFloat(p.price),
    0
  );
  const totalCredits = credits.reduce(
    (sum, c) => sum + parseFloat(c.amount),
    0
  );
  const creditsImpayes = credits.reduce(
    (sum, c) => (!c.paid ? sum + parseFloat(c.amount) : sum),
    0
  );

  doc.autoTable({
    body: [
      ["Total Ventes", `${totalVentes.toFixed(2)} DH`],
      ["Crédits Impayés", `${creditsImpayes.toFixed(2)} DH`]
    ],
    startY: doc.autoTable.previous.finalY + 25,
    theme: "plain",
    styles: {
      fontSize: 12,
      cellPadding: 6,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: "auto" },
      1: { fontStyle: "bold", halign: "right" },
    },
    headStyles: {
      fillColor: [52, 152, 219],
      textColor: 255,
    },
    margin: { top: 20 },
  });

  // Margin section
  doc.setFontSize(14);
  doc.text("Calcul de Marge", 14, doc.autoTable.previous.finalY + 20);

  // Get margin data
  const yesterdayCash =
    parseFloat(document.getElementById("yesterdayCash").value) || 0;
  const todayCash =
    parseFloat(document.getElementById("todayCash").value) || 0;
  const yesterdayDeler =
    parseFloat(document.getElementById("yesterdayDeler").value) || 0;
  const inwiRecharge =
    parseFloat(document.getElementById("inwiRecharge").value) || 0;
  const orangeRecharge =
    parseFloat(document.getElementById("orangeRecharge").value) || 0;
  const iamRecharge =
    parseFloat(document.getElementById("iamRecharge").value) || 0;
  const remainingInwi =
    parseFloat(document.getElementById("remainingInwi").value) || 0;
  const remainingOrange =
    parseFloat(document.getElementById("remainingOrange").value) || 0;
  const remainingIAM =
    parseFloat(document.getElementById("remainingIAM").value) || 0;
  const remainingCashe =
    parseFloat(document.getElementById("remainingCashe").value) || 0;
  const marginResult =
    document.getElementById("marginResult").textContent;

  doc.autoTable({
    body: [
      ["Fond de caisse d'hier", `${yesterdayCash.toFixed(2)} DH`],
      ["Fond de caisse d'aujourd'hui", `${todayCash.toFixed(2)} DH`],
      ["Total des 3 Dealer d'hier", `${yesterdayDeler.toFixed(2)} DH`],
      ["Total des 3 Dealer d'aujourd'hui", `${(remainingIAM+remainingInwi+remainingOrange).toFixed(2)} DH`],
      ["", ""],
      ["Recharge Inwi", `${inwiRecharge.toFixed(2)} DH`],
      ["Recharge Orange", `${orangeRecharge.toFixed(2)} DH`],
      ["Recharge IAM", `${iamRecharge.toFixed(2)} DH`],
      ["", ""],
      ["Reste Inwi", `${remainingInwi.toFixed(2)} DH`],
      ["Reste Orange", `${remainingOrange.toFixed(2)} DH`],
      ["Reste IAM", `${remainingIAM.toFixed(2)} DH`],
      ["", "___________"],
      ["Reste d'Argent", `${remainingCashe.toFixed(2)} DH`],
      ["Marge Calculée", marginResult],
    ],
    startY: doc.autoTable.previous.finalY + 25,
    theme: "plain",
    styles: {
      fontSize: 12,
      cellPadding: 6,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: "auto" },
      1: { fontStyle: "bold", halign: "right" },
    },
    headStyles: {
      fillColor: [155, 89, 182],
      textColor: 255,
    },
    didDrawCell: (data) => {
      if (data.column.index === 1 && data.row.index === 14) {
        const marginValue = parseFloat(marginResult.replace(" DH", ""));
        doc.setTextColor(marginValue >= 0 ? "#4CAF50" : "#F44336");
      }
    },
    margin: { top: 20 },
  });

  // Footer
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(
    `© ${new Date().getFullYear()} - Gestion Commerciale - Abderrafie Chate - Page ${doc.internal.getNumberOfPages()}`,
    105,
    285,
    { align: "center" }
  );

  // Save PDF
  doc.save(`rapport_commercial_${formatDate(currentDate)}.pdf`);

  // Update status
  document.getElementById("backupStatus").textContent =
    "PDF généré avec succès - " + new Date().toLocaleString();
}

// Event listeners
function initializeEventListeners() {
  // Calendar initialization
  const datepicker = $("#datepicker").datepicker({
    language: "fr",
    autoClose: true,
    dateFormat: "dd-mm-yyyy",
    onSelect: function (formattedDate) {
      const parts = formattedDate.split("-");
      const selectedDate = new Date(parts[2], parts[1] - 1, parts[0]);
      selectedDate.setHours(0, 0, 0, 0);
      loadDayData(selectedDate);
    },
  });

  $("#calendarTrigger").click(function () {
    datepicker.data("datepicker").show();
  });

  // Tab management
  const tabs = document.querySelectorAll(".tab");
  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");

      document.querySelectorAll(".tab-content").forEach((content) => {
        content.classList.remove("active");
      });
      document.getElementById(tab.dataset.tab).classList.add("active");
    });
  });

  // Product form
  document.getElementById("productForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const productName = document.getElementById("productName").value.trim();
    const productPrice = parseFloat(
      document.getElementById("productPrice").value
    );

    if (productName && !isNaN(productPrice)) {
      products.push({
        id: Date.now(),
        name: productName,
        price: productPrice.toFixed(2),
        sold: true,
        date: currentDate.toISOString(),
      });
      saveData();
      renderProducts();
      updateStats();
      this.reset();
    }
  });

  // Credit form
  document.getElementById("creditForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const borrowerName = document.getElementById("borrowerName").value.trim();
    const creditType = document.getElementById("creditType").value.trim();
    const creditAmount = parseFloat(
      document.getElementById("creditAmount").value
    );

    if (borrowerName && creditType && !isNaN(creditAmount)) {
      credits.push({
        id: Date.now(),
        borrower: borrowerName,
        type: creditType,
        amount: creditAmount.toFixed(2),
        paid: false,
        date: currentDate.toISOString(),
      });
      saveData();
      renderCredits();
      updateStats();
      this.reset();
    }
  });

  // Action buttons
  document.addEventListener("click", function (e) {
    if (e.target.tagName === "BUTTON" || e.target.closest("button")) {
      const button =
        e.target.tagName === "BUTTON" ? e.target : e.target.closest("button");
      const id = parseInt(button.dataset.id);
      const type = button.dataset.type;
      const action = button.dataset.action;

      if (type === "product") {
        deleteProduct(id);
      } else if (type === "credit") {
        if (action === "toggle") {
          toggleCreditStatus(id);
        } else if (action === "delete") {
          deleteCredit(id);
        }
      }
    }
  });
}

// Initialization on load
document.addEventListener("DOMContentLoaded", function () {
  initializeEventListeners();
  loadDayData(currentDate);
});
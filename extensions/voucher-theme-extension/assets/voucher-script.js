const shopifyId = window.customerId;
let apiResponseData;
async function apiSync() {
  const requestData = {
    CountryCode: "MY",
    shopifyID: shopifyId,
  };

  try {
    const [voucherRes, pointsRes] = await Promise.all([
      fetch(
        `https://techzonite.skechers.com.my/api/skechers/getMYCRMVoucher?shopifyID=${shopifyId}`
      ),
      fetch(`https://techzonite.skechers.com.my/api/skechers/getPointDetails`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      }),
    ]);

    const [voucherData, pointsData] = await Promise.all([
      voucherRes.json(),
      pointsRes.json(),
    ]);

    const current = pointsData.find((p) => p.PointsType === "Current");
    if (current) {
      document.getElementById("points-value").textContent =
        parseInt(current.PointsBALValue)
      document.getElementById("points-expiry").textContent = formatDate(
        current.PointsExpiringDate
      );
      document.getElementById("cycle-end").textContent = formatDate(
        current.CycEndDate
      );

      // Show the section after JS updates the values
      document.querySelector(".js-update").style.display = "block";
    }

    return { ...voucherData, points: pointsData };
  } catch (error) {
    console.error("API call error:", error);
    return null;
  }
}

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

function formatDate2(date) {
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getPointsFromVoucher(voucher) {
  if (
    voucher.VoucherTypeCode === "20Silver" ||
    voucher.VoucherTypeCode === "20Gold"
  ) {
    // Extract the number before "pts" in the VoucherTypeName
    const match = voucher.VoucherTypeName.match(/(\d+)pts/);
    return match ? match[1] : "180"; // Default to 180 if not found
  }
  return "180"; // Default value for other voucher types
}

if (window.customerId) {
  console.log("Customer ID:", window.customerId);

  apiSync()
    .then((res) => {
      if (!res) throw new Error("No API response received");
      apiResponseData = res;

      let voucherNumbers = [];

      apiResponseData.ActiveVoucherLists.forEach((voucher) => {
        voucherNumbers.push({ voucherNumber: voucher.VoucherNo });
      });
      apiResponseData.ExpiredVoucherLists.forEach((voucher) => {
        voucherNumbers.push({ voucherNumber: voucher.VoucherNo });
      });
      apiResponseData.RedeemedVoucherLists.forEach((voucher) => {
        voucherNumbers.push({ voucherNumber: voucher.VoucherNo });
      });

      let ActiveVouchers = apiResponseData.ActiveVoucherLists.map(
        (voucher) => ({
          voucherNumber: voucher.VoucherNo,
        })
      );

      return fetch(
        `https://techzonite.skechers.com.my/api/skechers/checkMYStoreVoucher`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(ActiveVouchers),
        }
      );
    })
    .then((response) => response.json())
    .then((data) => {
      if (!data || data.length === 0) {
        console.log("No matching vouchers found. Setting all to false.");
        apiResponseData.ActiveVoucherLists.forEach((voucher) => {
          voucher.isRedeem = false;
        });
      } else {
        apiResponseData.ActiveVoucherLists.forEach((voucher) => {
          const match = data.find(
            (apiVoucher) => apiVoucher.VoucherNumber === voucher.VoucherNo
          );
          voucher.isRedeem = match ? match.IsValid : false;
        });
      }

      showContent(apiResponseData);
      console.log("Updated apiResponseData:", apiResponseData);
    })
    .catch((error) => {
      console.error("Error checking voucher validity:", error);
      document.querySelectorAll(".loading-spinner").forEach((spinner) => {
        spinner.style.display = "none";
      });
    });
} else {
  console.log("Customer ID is not available.");
  document.querySelectorAll(".voucher-tabs__content").forEach((content) => {
    content.innerHTML =
      '<div class="no-vouchers">Please log in to view your vouchers</div>';
  });
}

function showContent(data) {
  try {
    // Safely handle each voucher list
    const activeVouchers = Array.isArray(data?.ActiveVoucherLists)
      ? data.ActiveVoucherLists
      : [];
    const redeemedVouchers = Array.isArray(data?.RedeemedVoucherLists)
      ? data.RedeemedVoucherLists
      : [];
    const expiredVouchers = Array.isArray(data?.ExpiredVoucherLists)
      ? data.ExpiredVoucherLists
      : [];

    // Helper function to create column layout
    const createColumnLayout = (vouchers, status) => {
      return `
        <div class="row">
          ${vouchers
            .map(
              (v) => `
            <div class="col-sm-12 col-md-6 col-lg-6 mb-4">
              ${generateVoucherRow({ ...v, status })}
            </div>
          `
            )
            .join("")}
        </div>
      `;
    };

    // Create column containers for each tab
    document.querySelector("#active-row").innerHTML =
      activeVouchers.length > 0
        ? createColumnLayout(activeVouchers, "Active")
        : '<div class="no-vouchers">No active vouchers found</div>';

    document.querySelector("#redeemed-row").innerHTML =
      redeemedVouchers.length > 0
        ? createColumnLayout(redeemedVouchers, "Redeemed")
        : '<div class="no-vouchers">No redeemed vouchers found</div>';

    document.querySelector("#expired-row").innerHTML =
      expiredVouchers.length > 0
        ? createColumnLayout(expiredVouchers, "Expired")
        : '<div class="no-vouchers">No expired vouchers found</div>';

    // Hide loading spinners
    document.querySelectorAll(".loading-spinner").forEach((spinner) => {
      spinner.style.display = "none";
    });
  } catch (error) {
    console.error("Error in showContent:", error);
    document.querySelectorAll(".voucher-tabs__content").forEach((content) => {
      content.innerHTML =
        '<div class="no-vouchers">Error loading vouchers</div>';
    });
  }
}

function getVoucherImage(voucherNo) {
  if (!voucherNo) return "https://via.placeholder.com/150";

  const voucherLower = voucherNo.toLowerCase();
  const defaultImage = "https://via.placeholder.com/150";

  // Find matching image
  const imageKey = Object.keys(window.voucherImageMap).find((key) =>
    voucherLower.includes(key.toLowerCase())
  );

  return imageKey ? window.voucherImageMap[imageKey] : defaultImage;
}

function generateVoucherRow(voucher) {
  if (!voucher) return "";

  // Get the appropriate image URL based on voucher number
  const imageUrl = getVoucherImage(voucher.VoucherNo);

  // Date handling
  let usageInfo = "";
  try {
    if (voucher.status === "Active" && voucher.ValidTo) {
      const endTimestamp = parseInt(voucher.ValidTo.match(/\d+/)[0]);
      const endDate = new Date(endTimestamp);

      // Special handling for Gold/Silver vouchers
      switch (voucher.status) {
        case "Active":
          if (
            voucher.VoucherTypeCode === "Gold-50Renewal" ||
            voucher.VoucherTypeCode === "Silver-30Welcome" ||
            voucher.VoucherTypeCode === "Gold-50Welcome"
          ) {
            usageInfo = `Use before ${formatDate2(endDate)}`;
          } else {
            let voucherPoints = getPointsFromVoucher(voucher);
            usageInfo = `Valid on ${formatDate2(endDate)}`;
          }
          break;
        case "Redeemed":
          if (voucher.VoucherUsedOn) {
            usageInfo = `Used on ${formatDate2(new Date(voucher.VoucherUsedOn))}`;
          }
          break;
        case "Expired":
          if (voucher.ValidTo) {
            const endTimestamp = parseInt(voucher.ValidTo.match(/\d+/)[0]);
            const endDate = new Date(endTimestamp);
            usageInfo = `Expired on ${formatDate2(endDate)}`;
          }
          break;
      }
    }
  } catch (e) {
    console.error("Error parsing date:", e);
  }

  // Button logic based on voucher status
  let claimButton = "";
  let imageClass = "col-image col-5";
  if (voucher.status === "Active") {
    if (voucher.isRedeem === false) {
      claimButton = `<button class="btn-claim" data-voucher="${
        voucher.VoucherNo || ""
      }">ACTIVATE</button>`;
    } else {
      claimButton = `<button class="btn-claim copied-btn copy-btn" data-voucher="${
        voucher.VoucherNo || ""
      }"><svg xmlns="http://www.w3.org/2000/svg"
             width="16" height="16"
             fill="currentColor"
             viewBox="0 0 16 16"
             class="icon-copy">
          <path d="M10 1.5A1.5 1.5 0 0 1 11.5 3v1h-1V3a.5.5 0 0 0-.5-.5H5A1.5 1.5 0 0 0 3.5 4v8A1.5 1.5 0 0 0 5 13.5h5a.5.5 0 0 0 .5-.5v-1h1v1A1.5 1.5 0 0 1 10 14.5H5A2.5 2.5 0 0 1 2.5 12V4A2.5 2.5 0 0 1 5 1.5h5z"/>
          <path d="M12.5 4a.5.5 0 0 1 .5.5V12a.5.5 0 0 1-.5.5H7a.5.5 0 0 1-.5-.5V4.5a.5.5 0 0 1 .5-.5h5.5zM7 3.5A1.5 1.5 0 0 0 5.5 5v7A1.5 1.5 0 0 0 7 13.5h5.5A1.5 1.5 0 0 0 14 12V5A1.5 1.5 0 0 0 12.5 3.5H7z"/>
        </svg> COPY CODE</button>`;
    }
  } else if (voucher.status === "Redeemed") {
    claimButton = `<button class="btn-redeemed" disabled>Redeemed</button>`;
    imageClass += " redeemed";
  } else if (voucher.status === "Expired") {
    claimButton = `<button class="btn-expired" disabled>Expired</button>`;
    imageClass += " expired";
  }

  return `
    <div class="voucher-card-container">
      <div class="voucher-card">
        <div class="row no-gutters h-100">
          <div class="${imageClass}">
            <img src="${imageUrl}" class="card-img" alt="Voucher Image" onclick="showTermsPopup('${
        voucher.VoucherTypeName
      }', '${voucher.VoucherNo}', '${usageInfo}', '${
    voucher.VoucherTypeCode
  }', '${voucher.VoucherTypeName}')" >
          </div>

          <div class="col-divider col-1">
            <div class="dotted-divider"></div>
          </div>

          <div class="col-details col-6">
            <div class="details-content">
              <p class="card-text">${voucher.VoucherTypeName || "Voucher"}</p>
              <p class="card-title">${voucher.VoucherNo || "N/A"}</p>
              <p class="usage-info">${usageInfo}</p>
            </div>
            <div class="claim-button-container">
              ${claimButton}
            </div>
          </div>
        </div>
      </div>

    </div>
  `;
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("see dom cus", shopifyId);
  initPopups();
  const tabs = document.querySelectorAll(".voucher-tabs__tab");

  tabs.forEach((tab) => {
    tab.addEventListener("click", function () {
      // Remove active class from all tabs and content
      document
        .querySelectorAll(".voucher-tabs__tab")
        .forEach((t) => t.classList.remove("active"));
      document
        .querySelectorAll(".voucher-tabs__content")
        .forEach((c) => c.classList.remove("active"));

      // Add active class to clicked tab
      this.classList.add("active");

      // Show corresponding content
      const tabId = this.getAttribute("data-tab");
      document.getElementById(tabId + "-vouchers").classList.add("active");
    });
  });
});
document.addEventListener("click", function (e) {
  if (
    e.target.classList.contains("btn-claim") &&
    !e.target.classList.contains("copied-btn")
  ) {
    const voucherNo = e.target.getAttribute("data-voucher");
    confirmRedeem(voucherNo);
  }
});

function confirmRedeem(voucherNo) {
  const confirmed = confirm(
    "Are you sure you want to redeem voucher number " + voucherNo + "?"
  );

  if (confirmed) {
    const voucher = apiResponseData.ActiveVoucherLists.find(
      (v) => v.VoucherNo === voucherNo
    );

    if (!voucher) {
      console.error("Voucher not found");
      alert("Voucher not found");
      return;
    }

    const apiUrl = `https://techzonite.skechers.com.my/api/skechers/activateMYStoreVoucher?shopifyID=${shopifyId}`;

    // Show loading state
    const btn = document.querySelector(
      `.btn-claim[data-voucher="${voucherNo}"]`
    );
    if (btn) {
      btn.textContent = "Processing...";
      btn.disabled = true;
    }

    fetch(apiUrl, {
      method: "POST", // Changed from OPTIONS to POST (OPTIONS is for CORS preflight)
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(voucher),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.json();
      })
      .then((data) => {
        if (data === true) {
          // Update button state
          if (btn) {

            if (lastCopiedButton && lastCopiedButton !== btn) {
              lastCopiedButton.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg"
                    width="16" height="16"
                    fill="currentColor"
                    viewBox="0 0 16 16"
                    class="icon-copy">
                  <path d="M10 1.5A1.5 1.5 0 0 1 11.5 3v1h-1V3a.5.5 0 0 0-.5-.5H5A1.5 1.5 0 0 0 3.5 4v8A1.5 1.5 0 0 0 5 13.5h5a.5.5 0 0 0 .5-.5v-1h1v1A1.5 1.5 0 0 1 10 14.5H5A2.5 2.5 0 0 1 2.5 12V4A2.5 2.5 0 0 1 5 1.5h5z"/>
                  <path d="M12.5 4a.5.5 0 0 1 .5.5V12a.5.5 0 0 1-.5.5H7a.5.5 0 0 1-.5-.5V4.5a.5.5 0 0 1 .5-.5h5.5zM7 3.5A1.5 1.5 0 0 0 5.5 5v7A1.5 1.5 0 0 0 7 13.5h5.5A1.5 1.5 0 0 0 14 12V5A1.5 1.5 0 0 0 12.5 3.5H7z"/>
                </svg>
                COPY CODE
              `;
            }

            btn.innerHTML = `
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                  fill="white" viewBox="0 0 24 24">
                <path d="M20.285 6.709l-11.285 11.285-5.285-5.285 1.414-1.414
                        3.871 3.871 9.871-9.871z"/>
              </svg>
              CODE COPIED
            `;
            lastCopiedButton = btn;
            btn.classList.add("copied-btn");
            btn.disabled = false;
          }
          // Copy voucher code to clipboard and show popup
          navigator.clipboard
            .writeText(voucherNo)
            .then(() => {
              showVoucherPopup2();
            })
            .catch((err) => {
              console.error("Copy failed:", err);
              showVoucherPopup2();
            });
        } else {
          throw new Error("Redeem failed");
        }
      })
      .catch((error) => {
        console.error("Error redeeming voucher:", error);
        alert("Failed to redeem voucher: " + error.message);
        // Reset button state
        if (btn) {
          btn.textContent = "Claim";
          btn.disabled = false;
        }
      });
  }
}

let popupsInitialized = false;
let lastCopiedButton = null;
// Initialize popups once (outside the generateVoucherRow function)
function initPopups() {
  if (popupsInitialized) return;

  popupsInitialized = true;

  // Add popups to body if they don't exist
  if (!document.getElementById("termsPopup")) {
    document.body.insertAdjacentHTML("beforeend", termsPopupHTML);
  }
  if (!document.getElementById("voucherPopup")) {
    document.body.insertAdjacentHTML("beforeend", voucherPopupHTML);
  }

  // Set up event listeners for voucher popup
  document.addEventListener("click", function (e) {
    // Handle copied button click
    if (e.target.classList.contains("copied-btn")) {
      const voucherCode = e.target.getAttribute("data-voucher");
      const btn = e.target;
      if (lastCopiedButton && lastCopiedButton !== btn) {
        lastCopiedButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg"
              width="16" height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
              class="icon-copy">
            <path d="M10 1.5A1.5 1.5 0 0 1 11.5 3v1h-1V3a.5.5 0 0 0-.5-.5H5A1.5 1.5 0 0 0 3.5 4v8A1.5 1.5 0 0 0 5 13.5h5a.5.5 0 0 0 .5-.5v-1h1v1A1.5 1.5 0 0 1 10 14.5H5A2.5 2.5 0 0 1 2.5 12V4A2.5 2.5 0 0 1 5 1.5h5z"/>
            <path d="M12.5 4a.5.5 0 0 1 .5.5V12a.5.5 0 0 1-.5.5H7a.5.5 0 0 1-.5-.5V4.5a.5.5 0 0 1 .5-.5h5.5zM7 3.5A1.5 1.5 0 0 0 5.5 5v7A1.5 1.5 0 0 0 7 13.5h5.5A1.5 1.5 0 0 0 14 12V5A1.5 1.5 0 0 0 12.5 3.5H7z"/>
          </svg>
          COPY CODE
        `;
      }
      btn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
            fill="white" viewBox="0 0 24 24">
          <path d="M20.285 6.709l-11.285 11.285-5.285-5.285 1.414-1.414
                  3.871 3.871 9.871-9.871z"/>
        </svg>
        CODE COPIED
      `;
      lastCopiedButton = btn;
      navigator.clipboard
        .writeText(voucherCode)
        .then(() => showVoucherPopup())
        .catch((err) => console.error("Copy failed:", err));
    }

    // Handle popup buttons
    if (e.target.classList.contains("btn-checkout")) {
      window.location.href = "/checkout";
    }
    if (e.target.classList.contains("btn-continue")) {
      closeVoucherPopup();
    }

    // Close when clicking outside
    if (e.target.classList.contains("voucher-popup")) {
      closeVoucherPopup();
    }
    if (e.target.classList.contains("terms-popup")) {
      closeTermsPopup();
    }
  });
}

function showTermsPopup(
  voucherType,
  voucherNo,
  usageInfo,
  voucherTypeCode,
  voucherTypeName
) {
  // Remove existing popup if present
  document.getElementById("termsPopup")?.remove();

  // Determine which popup HTML to use
  const isSpecialVoucher = [
    "Gold-50Renewal",
    "Silver-30Welcome",
    "Gold-50Welcome",
  ].includes(voucherTypeCode);
  const popupHTML = isSpecialVoucher ? termsPopupHTML : termsPopupHTML2;

  // Insert the popup
  document.body.insertAdjacentHTML("beforeend", popupHTML);
  const popup = document.getElementById("termsPopup");

  // Helper function to safely set element content
  const setContent = (selector, content, fallback = "N/A") => {
    const element = popup.querySelector(selector);
    if (element) element.textContent = content || fallback;
  };

  // Set popup content
  setContent("#popupVoucherType", voucherType);
  setContent("#popupUsageInfo", usageInfo);

  // Only for first popup type
  if (isSpecialVoucher) {
    setContent("#popupVoucherNo", voucherNo);
  }

  // For second popup type - extract points from voucher name
  if (!isSpecialVoucher) {
    const pointsMatch = voucherTypeName?.match(/(\d+)pts/);
    const pointsValue = pointsMatch ? pointsMatch[1] + " Points" : "180 Points";
    setContent("#popupPoints", pointsValue);
  }

  // Show the popup
  popup.style.display = "flex";
}

function closeTermsPopup() {
  document.getElementById("termsPopup").style.display = "none";
}

function showVoucherPopup() {
  document.getElementById("voucherPopup").style.display = "flex";
}

function closeVoucherPopup() {
  document.getElementById("voucherPopup").style.display = "none";
}

function showVoucherPopup2() {
  document.getElementById("voucherPopup2").style.display = "flex";
}

function closeVoucherPopup2() {
  document.getElementById("voucherPopup2").style.display = "none";
}

// Add Terms Popup HTML
const termsPopupHTML = `
    <div id="termsPopup" class="terms-popup">
    <div class="popupframe">
      <span class="close-btn" onclick="closeTermsPopup()">&times;</span>
      <div class="popup-content">
        <div class="voucher-details">
          <p><span id="popupVoucherType"></span></p>
          <p><span id="popupVoucherNo"></span></p>
          <p><span id="popupUsageInfo"></span></p>
          <p>Terms and Conditions apply.</p>
        </div>
        <div class="terms-content">
          <p>Voucher Terms & Conditions</p>
          <ul>
            <li>The Voucher is valid for 1 year from the date of issuance.</li>
            <li>The Voucher is applicable for use on the Skechers Malaysia website (www.skechers.com.my) and at selected Skechers Stores only.</li>
            <li>The Voucher is valid for one-time use in a single transaction only, applicable to in-store or online transaction.</li>
            <li>The Voucher cannot be used in conjunction with other promotions, applicable to in-store or online transaction.</li>
            <li>For members who upgrade to Silver tier and above, the voucher status will be updated 20 days after delivery is completed.</li>
            <li>Skechers Malaysia Sdn. Bhd. reserves the right to amend these Terms & Conditions at any time without prior notice.</li>
            <li>For more information on membership benefits, please refer to the <a href="https://www.skechers.com.my/pages/skechers-membership?srsltid=AfmBOoqa-aNrEJmNbDdsNe7OiGbs6TSH4BvrENjLeJ-uf4YHuzehSrO-" style="color: red; text-decoration: underline;" target="_blank" rel="noopener noreferrer">Skechers Membership</a> page.</li>
          </ul>
        </div>
      </div>
    </div>
    </div>
  `;

const termsPopupHTML2 = `
    <div id="termsPopup" class="terms-popup">
    <div class="popupframe">
    <span class="close-btn" onclick="closeTermsPopup()">&times;</span>
      <div class="popup-content">
        <div class="voucher-details">
          <p><span id="popupVoucherType"></span></p>
          <p><span id="popupUsageInfo"></span></p>
          <p>VALID FOR USE ON SAME DAY ONLY (Expires at 11:59 PM)</p>
          <p><span id="popupPoints"></span></p>
          <p>Terms and Conditions apply.</p>
        </div>
        <div class="terms-content">
          <p>Voucher Terms & Conditions</p>
          <ul>
            <li>The Voucher is valid for use on same day only and will expire at 11:59 PM on the date of issuance.</li>
            <li>The Voucher is applicable for use on the Skechers Malaysia website (www.skechers.com.my) and at selected Skechers Stores only.</li>
            <li>The Voucher is valid for one-time use in a single transaction only, applicable to in-store or online transaction.</li>
            <li>The Voucher cannot be used in conjunction with other promotions, applicable to in-store or online transaction.</li>
            <li>For members who upgrade to Silver tier and above, the voucher status will be updated 20 days after delivery is completed.</li>
            <li>Skechers Malaysia Sdn. Bhd. reserves the right to amend these Terms & Conditions at any time without prior notice.</li>
            <li>For more information on membership benefits, please refer to the <a href="https://www.skechers.com.my/pages/skechers-membership?srsltid=AfmBOoqa-aNrEJmNbDdsNe7OiGbs6TSH4BvrENjLeJ-uf4YHuzehSrO-" style="color: red; text-decoration: underline;" target="_blank" rel="noopener noreferrer">Skechers Membership</a> page.</li>
          </ul>
        </div>
      </div>
    </div>
    </div>
  `;

// Add Voucher Copied Popup HTML
const voucherPopupHTML = `
    <div id="voucherPopup" class="voucher-popup">
      <div class="popupframe2">
      <span class="close-btn" onclick="closeVoucherPopup()">&times;</span>
      <div class="popup-content">

        <div class="popup-image">
          <img src="${window.voucherImageMap ? window.voucherImageMap['greentick'] : ''}" alt="Success" />
        </div>
        <div class="popup-message">
          <p>Voucher Code Copied!</p>
          <p>Apply the code at checkout to enjoy your exclusive discount. </p>
        </div>
      </div>
      </div>
    </div>
  `;

  const voucherPopupHTML2 = `
    <div id="voucherPopup2" class="voucher-popup">
      <div class="popupframe2">
      <span class="close-btn" onclick="closeVoucherPopup2()">&times;</span>
      <div class="popup-content">

        <div class="popup-image">
          <img src="${window.voucherImageMap ? window.voucherImageMap['greentick'] : ''}" alt="Success" />
        </div>
        <div class="popup-message">
          <p>Redeem successful!</p>
          <p>Voucher Code Copied!</p>
          <p>Apply the code at checkout to enjoy your exclusive discount. </p>
        </div>
      </div>
      </div>
    </div>
  `;

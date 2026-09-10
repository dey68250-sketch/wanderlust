
    document.querySelectorAll(".filter-item").forEach((item) => {
      item.addEventListener("click", () => {
        document
          .querySelectorAll(".filter-item")
          .forEach((el) => el.classList.remove("active"));
        item.classList.add("active");

        const category = item.dataset.filter;
        window.location.href = `/listings?category=${category}`;
      });
    });

    const TAX_RATE = 0.18;
    const taxToggle = document.getElementById("taxToggle");

    function updatePrices() {
      const showBeforeTax = taxToggle.checked;
      document.querySelectorAll(".price-display").forEach((el) => {
        const basePrice = parseFloat(el.dataset.basePrice);
        const displayPrice = showBeforeTax
          ? basePrice
          : basePrice * (1 + TAX_RATE);

        el.innerHTML = `&#8377; ${Math.round(displayPrice).toLocaleString(
          "en-IN"
        )} / night${showBeforeTax ? "" : " (incl. taxes)"}`;
      });
    }

    taxToggle.addEventListener("change", updatePrices);
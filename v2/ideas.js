// «Що вміє Dibsly» (2026-10-21): the ideas' live examples — tap an operation and watch On hand and the month, switch
// «Враховувати в балансі», top up a portfolio — then «Що далі»: «Хочу це» on the roadmap and the form «Чого тобі не
// вистачає?». The votes and the form go to Dibsly's server through this site's Worker (/api/…).
(function () {
    var uk = document.documentElement.lang === "uk";

    function money(value, currency) {
        var whole = Math.round(Math.abs(value));
        var text = uk ? String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, " ") : whole.toLocaleString("en-US");
        var sign = value < 0 ? "−" : "";
        if (currency === "$") return uk ? sign + text + " $" : sign + "$" + text;
        return uk ? sign + text + " ₴" : sign + "₴" + text;
    }

    function show(box, totals) {
        Object.keys(totals).forEach(function (key) {
            var cell = box.querySelector('[data-total="' + key + '"]');
            if (!cell) return;
            var text = money(totals[key], cell.dataset.currency);
            if (cell.textContent !== text) {
                cell.textContent = text;
                cell.classList.remove("bump");
                void cell.offsetWidth;
                cell.classList.add("bump");
            }
        });
    }

    // Tap an operation: it is added to the month (or taken back), and the totals above follow.
    document.querySelectorAll(".live-ledger").forEach(function (box) {
        var start = JSON.parse(box.dataset.start);
        function recount() {
            var totals = Object.assign({}, start);
            box.querySelectorAll(".row.on").forEach(function (row) {
                var effect = JSON.parse(row.dataset.effect);
                Object.keys(effect).forEach(function (key) { totals[key] += effect[key]; });
            });
            show(box, totals);
        }
        box.querySelectorAll(".row").forEach(function (row) {
            row.addEventListener("click", function () {
                row.classList.toggle("on");
                row.setAttribute("aria-pressed", row.classList.contains("on") ? "true" : "false");
                recount();
            });
        });
        recount();
    });

    // «Враховувати в балансі»: the big number moves, the month's income does not.
    document.querySelectorAll(".live-switch").forEach(function (box) {
        var input = box.querySelector("input");
        var base = JSON.parse(box.dataset.start);
        var account = Number(box.dataset.account);
        function recount() {
            show(box, { hand: base.hand + (input.checked ? account : 0), income: base.income });
        }
        input.addEventListener("change", recount);
        recount();
    });

    // A deposit grows the portfolio but not the growth; the market grows both.
    document.querySelectorAll(".live-growth").forEach(function (box) {
        var start = JSON.parse(box.dataset.start);
        var state = Object.assign({}, start);
        function recount() {
            show(box, { deposits: state.deposits, value: state.value, growth: state.value - state.deposits });
        }
        box.querySelectorAll("button[data-act]").forEach(function (button) {
            button.addEventListener("click", function () {
                if (button.dataset.act === "deposit") { state.deposits += 1000; state.value += 1000; }
                if (button.dataset.act === "market") state.value = Math.round(state.value * 1.05);
                if (button.dataset.act === "reset") state = Object.assign({}, start);
                recount();
            });
        });
        recount();
    });

    // «Хочу це»: one vote a browser, kept by a random ID in this browser only.
    var voterKey = "dibsly.site.voter", votedKey = "dibsly.site.voted";
    function stored(key, fallback) {
        try { var value = localStorage.getItem(key); return value === null ? fallback : value; } catch (error) { return fallback; }
    }
    function keep(key, value) { try { localStorage.setItem(key, value); } catch (error) {} }
    var voter = stored(voterKey, "");
    if (!/^[A-Za-z0-9-]{16,64}$/.test(voter)) {
        voter = crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + "-" + Math.random().toString(36).slice(2, 14);
        keep(voterKey, voter);
    }
    var voted = {};
    try { voted = JSON.parse(stored(votedKey, "{}")) || {}; } catch (error) { voted = {}; }

    var buttons = document.querySelectorAll(".want");
    function paint(votes) {
        buttons.forEach(function (button) {
            var item = button.dataset.item;
            button.classList.toggle("on", !!voted[item]);
            button.setAttribute("aria-pressed", voted[item] ? "true" : "false");
            var count = button.querySelector("b");
            if (votes && item in votes) count.textContent = votes[item] > 0 ? String(votes[item]) : "";
        });
    }
    if (buttons.length) {
        paint(null);
        fetch("/api/roadmap").then(function (answer) { return answer.ok ? answer.json() : null; })
            .then(function (body) { if (body) paint(body.votes); }).catch(function () {});
        buttons.forEach(function (button) {
            button.addEventListener("click", function () {
                var item = button.dataset.item;
                var on = !voted[item];
                voted[item] = on;
                if (!on) delete voted[item];
                keep(votedKey, JSON.stringify(voted));
                var count = button.querySelector("b");
                var now = Number(count.textContent || 0) + (on ? 1 : -1);
                count.textContent = now > 0 ? String(now) : "";
                paint(null);
                fetch("/api/roadmap/vote", { method: "POST", headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ item: item, voter: voter, on: on }) })
                    .then(function (answer) { return answer.ok ? answer.json() : null; })
                    .then(function (body) { if (body) paint(body.votes); }).catch(function () {});
            });
        });
    }

    // «Чого тобі не вистачає?»
    var form = document.querySelector(".missing-form");
    if (form) {
        var status = form.querySelector(".form-status");
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            var text = form.elements.text.value.trim();
            if (!text) { form.elements.text.focus(); return; }
            var button = form.querySelector("button");
            button.disabled = true;
            status.className = "form-status";
            status.textContent = "";
            fetch("/api/feedback", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
                text: text, email: form.elements.email.value.trim(), company: form.elements.company.value,
                language: uk ? "uk" : "en", page: location.pathname }) })
                .then(function (answer) {
                    if (answer.ok) {
                        form.classList.add("sent");
                        status.className = "form-status ok";
                        status.textContent = form.dataset.thanks;
                        form.reset();
                    } else {
                        status.className = "form-status down";
                        status.textContent = answer.status === 429 ? form.dataset.later
                            : answer.status === 400 && form.elements.email.value.trim() ? form.dataset.email : form.dataset.failed;
                    }
                })
                .catch(function () {
                    status.className = "form-status down";
                    status.textContent = form.dataset.failed;
                })
                .then(function () { button.disabled = false; });
        });
    }
})();

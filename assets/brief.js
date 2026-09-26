/* Project brief builder.
 *
 * The visitor picks what they need and when, writes a line or two, and sends
 * it on WhatsApp or by email as a ready-written message. There is no backend
 * and no third party: the message is composed here and handed to wa.me or a
 * mailto: link.
 *
 * All wording comes from data- attributes on the form, so the same script
 * serves both languages and never needs editing for a translation.
 *
 * Without JavaScript the form still works: it is a GET form to wa.me whose
 * textarea is named "text", which is the parameter WhatsApp prefills. The
 * email button falls back to a mailto: form post. The radio groups are named
 * "kind" and "when", never "type": wa.me uses "type" itself.
 */
(function () {
  "use strict";

  var form = document.getElementById("brief");
  if (!form) return;

  var text = form.querySelector("textarea");
  var error = document.getElementById("brief-error");
  var d = form.dataset;

  function checked(name) {
    var el = form.querySelector('input[name="' + name + '"]:checked');
    return el ? el.value : "";
  }

  function compose() {
    var lines = [d.greeting, ""];
    lines.push(d.lKind + ": " + checked("kind"));
    lines.push(d.lWhen + ": " + checked("when"));
    var name = form.querySelector('input[name="name"]').value.trim();
    if (name) lines.push(d.lName + ": " + name);
    lines.push("", text.value.trim(), "", d.signature);
    return lines.join("\n");
  }

  function showError(on) {
    error.hidden = !on;
    if (on) {
      text.setAttribute("aria-invalid", "true");
    } else {
      text.removeAttribute("aria-invalid");
    }
  }

  text.addEventListener("input", function () {
    if (!error.hidden && text.value.trim().length >= 10) showError(false);
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    /* A sentence is the least that can be quoted from. The error sits next
       to the field and is announced (role="alert"), and focus goes back to
       the field so a keyboard or screen-reader user lands where the fix is. */
    if (text.value.trim().length < 10) {
      showError(true);
      text.focus();
      return;
    }
    showError(false);

    var via = event.submitter && event.submitter.getAttribute("data-send");
    var message = compose();

    if (via === "email") {
      location.href =
        "mailto:" + d.email +
        "?subject=" + encodeURIComponent(d.subject + ": " + checked("kind")) +
        "&body=" + encodeURIComponent(message);
      return;
    }

    var url = "https://wa.me/" + d.phone + "?text=" + encodeURIComponent(message);
    /* A new tab keeps the brief on screen. Do NOT pass "noopener" to
       window.open: with it the call always returns null, the fallback below
       then fires too, and the page navigates away from the visitor's brief.
       Open a blank tab, cut its link back to this page, then send it on.
       Only a tab that really was blocked falls back to this one. */
    var tab = window.open("", "_blank");
    if (tab) {
      tab.opener = null;
      tab.location.href = url;
    } else {
      location.href = url;
    }
  });
})();

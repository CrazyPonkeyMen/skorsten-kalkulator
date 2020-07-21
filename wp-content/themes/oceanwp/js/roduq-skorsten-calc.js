var rq_VAT = 23;

var selectedDiameterArray,
  selectedHeightArray,
  selectedAirbrickArray,
  object_rq;
/*
var selectedDiameterArray = systems_data[document.getElementById("typ_systemu").value][1];
var selectedHeightArray = systems_data[document.getElementById("typ_systemu").value][1][document.getElementById("srednica").value][1];
var selectedAirbrickArray = systems_data[document.getElementById("typ_systemu").value][1][document.getElementById("srednica").value][1][document.getElementById("wysokosc").value][1];
var object_rq = document.getElementById("form-field-skorsten_system");

*/
var debug_table = [];
var systems_data;
var empty_calculation_html;
var empty_header_html;
var active_splitter_id;

var rq_loading_complete_mark = 5;
var rq_loading_complete_status = 0;
var rq_picture_pustak_select_data = [];
function RQcheckIfLoadingComplete() {
  if (rq_loading_complete_status == rq_loading_complete_mark) {
    if (GetURLParameter("edit") == null)
      $("#rq_loading_anim, .boxes").hide(500);
    rq_getSavedSelections();
  } else
    setTimeout(() => {
      RQcheckIfLoadingComplete();
    }, 200);
}
RQcheckIfLoadingComplete();

$.urlParam = function (name) {
  var results = new RegExp("[?&]" + name + "=([^&#]*)").exec(
    window.location.href
  );
  return results[1] || 0;
};
function check_for_additional_products() {
  setTimeout(() => {
    if (
      $("#form-field-add_enable").length +
      $("#rq_additional_products_switch").length
    ) {
      $("#rq_additional_products_switch").on("click", function () {
        if (
          $("section#single_element_section_id").length == 1 &&
          $("section#single_element_section_id").css("display") == "none"
        )
          $("#form-field-add_enable").click();
        else {
          $("#rq_add_next_element > span").click();
          check_if_new_additional_product_appeared(0);
        }
      });
    } else check_for_additional_products();
  }, 200);
}
check_for_additional_products();
function check_if_new_additional_product_appeared(failure_check) {
  if (failure_check == 10) return;
  var previous_length = $("section#single_element_section_id").length;
  failure_check++;
  setTimeout(() => {
    if (
      previous_length != $("section#single_element_section_id").length ||
      failure_check == 9
    ) {
      $("section#single_element_section_id")
        .last()
        .find("i")
        .on("click", function () {
          if ($("section#single_element_section_id").length == 1) {
            $("#form-field-add_enable").click();
          }
        });
    } else check_if_new_additional_product_appeared(failure_check);
  }, 100);
}
function create_array_of_active_airbricks(selectedAirbrickArray) {
  var active_table = [];
  var pustak_image_counter;
  for (
    pustak_image_counter = 0;
    pustak_image_counter < rq_picture_pustak_select_data.length;
    pustak_image_counter++
  ) {
    var selected_pustak_counter;
    for (
      selected_pustak_counter = 0;
      selected_pustak_counter < selectedAirbrickArray.length;
      selected_pustak_counter++
    ) {
      if (
        selectedAirbrickArray[selected_pustak_counter] ==
        rq_picture_pustak_select_data[pustak_image_counter].text
      )
        active_table.push(rq_picture_pustak_select_data[pustak_image_counter]);
    }
  }
  return active_table;
}

function generate_select_from_airbricks(selector, data, origin) {
  selector.ddslick({
    data: data,
    width: 400,
    height: 300,
    selectText: "Wybierz typ pustaka",
    imagePosition: "left",
    onSelected: function (selectedData) {
      trigger_image_select_change(origin);
    },
  });
}

function trigger_image_select_change(origin) {
  if (origin.find(".dd-selected").length) {
    var active_value = origin.find(".dd-selected").text();
    origin.find("#form-field-skorsten_pustak_priv").val(active_value);
    origin.find("#form-field-skorsten_pustak").val(active_value);
    origin.find("#form-field-skorsten_pustak").trigger("change");
  }
}

var airbrick_types_array;
var rq_import_airbrick_type = function () {
  $.ajax({
    type: "post",
    url:
      "https://skorstentransfer.essin.pl/skorsten-kalkulator/wp-admin/admin-ajax.php",
    data: {
      action: "rq_import_airbrick_types",
    },
    complete: function (data) {
      rq_loading_complete_status++;

      data_string = data["responseText"].slice(0, -1);
      airbrick_types_array = jQuery.parseJSON(data_string);
      function add_all_airbricks() {
        var pustak_image_counter;
        //$("#skorsten_pustak_image").find("ul").empty();
        //$("#skorsten_pustak_image").find("select").empty();

        for (
          pustak_image_counter = 0;
          pustak_image_counter < airbrick_types_array.length;
          pustak_image_counter++
        ) {
          var airbrick_thumbnail;
          if (airbrick_types_array[pustak_image_counter].thumbnail != "false")
            airbrick_thumbnail =
              airbrick_types_array[pustak_image_counter].thumbnail;
          else airbrick_thumbnail = "";
          var airbrick_title = airbrick_types_array[pustak_image_counter].title;
          rq_picture_pustak_select_data.push({
            text: airbrick_title,
            value: airbrick_title,
            selected: false,
            description: "",
            imageSrc: airbrick_thumbnail,
          });
        }
      }
      add_all_airbricks();
    },
  });
};
rq_import_airbrick_type();

var rq_import_systems_data = function () {
  $.ajax({
    type: "post",
    url:
      "https://skorstentransfer.essin.pl/skorsten-kalkulator/wp-admin/admin-ajax.php",
    data: {
      action: "rq_import_systems_data",
    },
    complete: function (data) {
      rq_loading_complete_status++;

      data_string = data["responseText"].slice(0, -1);
      systems_data = jQuery.parseJSON(data_string);
      allofthethings();
    },
  });
};
rq_import_systems_data();

var accessories_data;
var rq_import_accessories_data = function () {
  $.ajax({
    type: "post",
    url:
      "https://skorstentransfer.essin.pl/skorsten-kalkulator/wp-admin/admin-ajax.php",
    data: {
      action: "rq_import_accessories_data",
    },
    complete: function (data) {
      rq_loading_complete_status++;

      data_string = data["responseText"].slice(0, -1);
      accessories_data = jQuery.parseJSON(data_string);
    },
  });
};
rq_import_accessories_data();

var single_elements_array;
var rq_import_single_elements = function () {
  $.ajax({
    type: "post",
    url:
      "https://skorstentransfer.essin.pl/skorsten-kalkulator/wp-admin/admin-ajax.php",
    data: {
      action: "rq_import_single_elements",
    },
    complete: function (data) {
      rq_loading_complete_status++;

      data_string = data["responseText"].slice(0, -1);
      single_elements_array = jQuery.parseJSON(data_string);
      write_single_elements_data();
    },
  });
};
rq_import_single_elements();

Selectize.prototype.positionDropdown = function () {
  var $control = this.$control;
  var $window = $(window);

  this.$dropdown.css({ position: "fixed" });

  var control_height = $control.outerHeight(false);
  var control_space_above = $control.offset().top - $window.scrollTop();
  var control_space_below =
    $window.height() - control_space_above - control_height;
  var dropdown_height = this.$dropdown.outerHeight(false);

  var up = dropdown_height > control_space_below ? "true" : false;

  var offset =
    this.settings.dropdownParent === "body"
      ? $control.offset()
      : $control.position();
  offset.top += $control.outerHeight(true);

  if (up) {
    offset.top = control_space_above - dropdown_height;
    offset.left = $control.offset().left;

    this.$dropdown.css({
      "border-top-color": "hsl(0, 0%, 72%)",
      "border-top-width": "1px",
      "border-top-style": "solid",
      "border-bottom-width": "0",
      width: $control.outerWidth(),
      position: "fixed",
      top: offset.top,
      left: offset.left,
      display: "block !important",
    });
  } else {
    this.$dropdown.css({
      width: $control.outerWidth(),
      top: offset.top,
      left: offset.left,
      position: "absolute",
      "border-bottom-color": "hsl(0, 0%, 72%)",
      "border-bottom-width": "1px",
      "border-bottom-style": "solid",
      "border-top-width": "0",
    });
  }
};

function addCustomersIntoSelect(previous_customer_id) {
  $("#form-field-selected_customer").selectize()[0].selectize.destroy();
  var customers_field = $("#form-field-selected_customer");
  customers_field.find("option").remove();
  if (customers_field.length != 0 && customers_array !== "Dodaj klientów") {
    var customers_counter;
    if (customers_array !== null) {
      for (
        customers_counter = 0;
        customers_counter < customers_array.length;
        customers_counter++
      ) {
        var customer_title = customers_array[customers_counter]["post_title"];
        var customer_id = customers_array[customers_counter]["ID"];
        customers_field.append(
          new Option(customer_id + " " + customer_title, customer_id)
        );
      }
    } else $("#rq_select_customer_field").hide();
    $("#form-field-selected_customer_id").val("0000");
    customers_field.on("click", function () {
      if (customers_field.val() == "" || customers_array === "Dodaj klientów")
        $("#form-field-selected_customer_id").val("0000");
      else $("#form-field-selected_customer_id").val(customers_field.val());
    });
  } else if (customers_array !== "Dodaj klientów") {
    setTimeout(() => {
      addCustomersIntoSelect();
    }, 200);
  }
  if (customers_array === "Dodaj klientów") {
    customers_field.empty();
    customers_field.append(new Option(customers_array, null));
  }

  $("#form-field-selected_customer").selectize();
  if (previous_customer_id)
    $("#form-field-selected_customer")
      .selectize()[0]
      .selectize.setValue(previous_customer_id);
  else $("#form-field-selected_customer").selectize()[0].selectize.clear();
  $("#form-field-selected_customer").on("change", function () {
    var customer_id_value = $(this).val();
    $.ajax({
      type: "post",
      url:
        "https://skorstentransfer.essin.pl/skorsten-kalkulator/wp-admin/admin-ajax.php",
      data: {
        action: "ask_for_customer_note",
        customer_id: customer_id_value,
      },
      complete: function (data) {
        data_string = data["responseText"].slice(0, -1);
        customer_note = jQuery.parseJSON(data_string);
        $("#rq_customer_notes").text(customer_note);
      },
    });
  });
}
var customers_array;
var rq_import_customers = function (customer_id) {
  $.ajax({
    type: "post",
    url:
      "https://skorstentransfer.essin.pl/skorsten-kalkulator/wp-admin/admin-ajax.php",
    data: {
      action: "rq_import_user_customers",
    },
    complete: function (data) {
      rq_loading_complete_status++;

      data_string = data["responseText"].slice(0, -1);
      customers_array = jQuery.parseJSON(data_string);
      addCustomersIntoSelect(customer_id);
    },
  });
};
rq_import_customers();

function defineVariables() {
  var object_rq = document.getElementById("form-field-skorsten_system");
}

// functions
function resetSelect(selectID) {
  var selectElement = document.getElementById(selectID);
  selectElement.selectedIndex = "999";
  for (i = selectElement.length - 1; i >= 0; i--) selectElement.remove(i);
  selectElement.selectedIndex = "";
}
function addArrayToSelectStandard(array, selectID) {
  var sel = document.getElementById(selectID);
  var fragment = document.createDocumentFragment();
  for (i = 0; i < array.length; i++) {
    var newOption = document.createElement("option");
    newOption.text = array[i];
    newOption.value = array[i];
    fragment.appendChild(newOption);
  }
  sel.appendChild(fragment);
}
function addArrayToSelectStandard_Combo(array, selectID) {
  var sel = document.getElementById(selectID);
  var fragment = document.createDocumentFragment();
  for (i = 0; i < array.length; i++) {
    var newOption = document.createElement("option");
    newOption.text = array[i] + " / 80";
    newOption.value = array[i];
    fragment.appendChild(newOption);
  }
  sel.appendChild(fragment);
}
function addArrayToSelectElements(array, selectID) {
  var sel = document.getElementById(selectID);
  var fragment = document.createDocumentFragment();
  if (array != null)
    for (i = 0; i < array.length; i++) {
      var newOption = document.createElement("option");
      newOption.text = array[i][0];
      newOption.value = array[i][1];
      fragment.appendChild(newOption);
    }
  else {
    var newOption = document.createElement("option");
    newOption.text = "Brak";
    newOption.value = 0;
    fragment.appendChild(newOption);
  }
  sel.appendChild(fragment);
}
function addArrayToSelectElements_JQuery(array, selector) {
  if (array != null)
    for (i = 0; i < array.length; i++) {
      selector.append(new Option(array[i][0], array[i][1]));
    }
  else selector.append(new Option("Brak", 0));
}
function addArrayToSelectStandard_Element(array, selectID, main_array) {
  var sel = document.getElementById(selectID);
  var fragment = document.createDocumentFragment();
  for (i = 0; i < array.length; i++) {
    var newOption = document.createElement("option");
    if (!empty(main_array[array[i]]))
      newOption.text =
        array[i] + " (" + main_array[array[i]].length.toString() + ")";
    else newOption.text = array[i] + " (0)";
    newOption.value = array[i];
    fragment.appendChild(newOption);
  }
  sel.appendChild(fragment);
}
function addArrayToSelectStandard_Element_JQuery(array, selector, main_array) {
  for (i = 0; i < array.length; i++) {
    if (!empty(main_array[array[i]]))
      selector.append(
        new Option(
          array[i] + " (" + main_array[array[i]].length.toString() + ")",
          array[i]
        )
      );
    else selector.append(new Option(array[i] + " (0)", array[i]));
  }
}
function addArrayToSelectJQuery(array, selector) {
  for (i = 0; i < array.length; i++) {
    selector.append(new Option(array[i], array[i]));
  }
}
function addArrayToSelectJQuery_Combo(array, selector) {
  for (i = 0; i < array.length; i++) {
    selector.append(new Option(array[i] + " / 80", array[i]));
  }
}
function reloadAll() {
  resetSelect("srednica");
  addArrayToSelectStandard(selectedDiameterArray, "srednica");
  resetSelect("wysokosc");
  addArrayToSelectStandard(selectedHeightArray, "wysokosc");
}
function reloadDiameter() {
  resetSelect("srednica");
  selectedDiameterArray =
    systems_data[document.getElementById("typ_systemu").value][1];
  addArrayToSelectStandard(selectedDiameterArray, "srednica");
}
function reloadHeight() {
  resetSelect("wysokosc");
  selectedHeightArray =
    systems_data[document.getElementById("typ_systemu").value][1][
      document.getElementById("srednica").value
    ][1];
  addArrayToSelectStandard(selectedHeightArray, "wysokosc");
}

function empty(data) {
  if (typeof data == "number" || typeof data == "boolean") {
    return false;
  }
  if (typeof data == "undefined" || data === null) {
    return true;
  }
  if (typeof data.length != "undefined") {
    return data.length == 0;
  }
  var count = 0;
  for (var i in data) {
    if (data.hasOwnProperty(i)) {
      count++;
    }
  }
  return count == 0;
}
function sumAllTotals(vat = false) {
  var allTotals = $("div#form-field-calc_single_summary");
  var allTotal = 0;
  for (i = 0; i < allTotals.length; i++) {
    if (!isNaN(allTotals.eq(i).text()))
      allTotal += parseFloat(allTotals.eq(i).text());
  }
  allTotal += parseFloat(
    $(".pafe-calculated-fields-form__value").last().text()
  );
  if (vat != false) {
    allTotal = allTotal.toFixed(0);
    allTotal = allTotal * (1 + vat / 100);
  }
  if (vat == false) return allTotal.toFixed(2);
  return allTotal.toFixed(2);
}
function getOnlyTitles(array) {
  if (array == null) return;
  var temp_array = [];
  for (i = 0; i < array.length; i++) {
    temp_array.push([array[i]["title"], array[i]["price"]]);
  }
  return temp_array;
}
function hovering_email_update() {
  var temp_table_to_send_email = "";
  for (
    let index = 0;
    index < document.getElementsByClassName("rq_calculation").length;
    index++
  ) {
    const element = $("input#form-field-skorsten_table_mail").eq(index * 2 + 1);
    const title = $("span#bdt-accordion-kalkulacja").eq(index).text().trim();
    const amount = $("input#form-field-skorsten_amount").eq(index).val();
    const discount = $("input#form-field-skorsten_rabat").eq(index).val();
    const price_netto = $("div#form-field-calc_single_summary")
      .eq(index)
      .text();
    const price_brutto = $("div#form-field-calc_single_summary_brutto")
      .eq(index)
      .text();
    var element_formatted = element
      .val()
      .replace(/(<th>)+/g, "<td><b>")
      .replace(/(<\/th>)+/g, "</b></td>");

    temp_table_to_send_email += `<b>${title}</b>
    Ilość: ${amount}&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Rabat: ${discount}%
    Suma netto: <b>${price_netto}zł</b>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Suma brutto: <b>${price_brutto}zł</b>
    <b>Skład systemu:</b>
    ${element_formatted}`;

    if (index != document.getElementsByClassName("rq_calculation").length - 1)
      temp_table_to_send_email += "<br /><br />";
  }

  for (
    let index = 0;
    index <
    $("section[data-pafe-form-builder-repeater-id='repeater_add_single']")
      .length;
    index++
  ) {
    const element = $(
      "section[data-pafe-form-builder-repeater-id='repeater_add_single']"
    ).eq(index);
    const name = element
      .find("#form-field-rq_single_element option:selected")
      .text();
    const amount = element.find("#form-field-add_single_quantity").val();
    const price = element.find(".pafe-calculated-fields-form__value").text();
    if (!(index == 0 && amount == "")) {
      if (index == 0) {
        temp_table_to_send_email += "<br /><br />";
        temp_table_to_send_email += "<h2>Elementy komina:</h2><br />";
      }

      temp_table_to_send_email += `${amount} X ${name} = ${price}zł (${(
        parseFloat(price) *
        (1 + rq_VAT / 100)
      )
        .toFixed(2)
        .toString()}zł brutto)
      `;
    }
  }
  const total_sums_for_email = $("div#form-field-calc_total_summary").text();
  const total_sums_for_email_brutto = $(
    "div#form-field-calc_total_summary_brutto"
  ).text();
  temp_table_to_send_email += "<br /><br />";
  temp_table_to_send_email += "<h2>Suma całkowita:</h2>";
  temp_table_to_send_email += `<b>Suma netto: ${total_sums_for_email}</b>
  <b>Suma brutto: ${total_sums_for_email_brutto}</b>`;

  $("#form-field-skorsten_mail_quickfix").val(temp_table_to_send_email);
}
function hideAllCalculations_excl_last(animtime = 400) {
  /* $("div#skorsten_element_title").show(animtime);
  $("section#rq_toggle > div > div > div:not(#rq_col_1)").each(function(){
    $(this).hide(animtime);
  });
  $("section#rq_toggle > div > div > #rq_col_1 > div > div > div:not(#skorsten_element_title, .rq_toggle_1)").each(function(){
    $(this).hide(animtime);
  }); */
}
function hideAllCalculations(animtime = 400) {
  /* $("div#skorsten_element_title").show(animtime);
  $("section#rq_toggle > div > div > div:not(#rq_col_1)").each(function(){
    $(this).hide(animtime);
  });
  $("section#rq_toggle > div > div > #rq_col_1 > div > div > div:not(#skorsten_element_title, .rq_toggle_1)").each(function(){
    $(this).hide(animtime);
  }); */
}
function showAllCalculations(animtime = 400) {
  /* $("div#skorsten_element_title").hide(animtime);
  $("section#rq_toggle > div > div > div:not(#rq_col_1)").each(function(){
    $(this).show(animtime);
  });
  $("section#rq_toggle > div > div > #rq_col_1 > div > div > div:not(#skorsten_element_title, .rq_toggle_1)").each(function(){
    $(this).show(animtime);
  }); */
}
function checkForNiceNumberEventListener_refresh() {
  $(".nice-number").each(function () {
    if (!$(this).hasClass("refresher_added")) {
      $(this).focusout(function () {
        //Main calculations
        $("input#form-field-skorsten_amount").trigger("change");
        $("input#form-field-skorsten_rabat").trigger("change");
        $(this).trigger("click");

        //Additional products
        $("input#form-field-add_single_quantity").trigger("change");
        $("input#form-field-add_single_rabat").trigger("change");
      });
      $(this).addClass("refresher_added");
    }
  });
}
// Jquery event listeners and toggle
function allofthethings() {
  checkForNiceNumberEventListener_refresh();
  function update_prices_showed() {
    setTimeout(() => {
      $("#form-field-calc_total_summary").text(sumAllTotals());
      $("#form-field-calc_total_summary_brutto").text(sumAllTotals(rq_VAT));
      $("#form-field-skorsten_total_all_sum").val(sumAllTotals());
      $("#form-field-skorsten_total_all_sum_brutto").val(sumAllTotals(rq_VAT));
      update_prices_showed();
    }, 2000);
  }
  update_prices_showed();
  $("#rq_menu_region").hover(function () {
    $("#form-field-skorsten_total_all_sum").val(sumAllTotals());
    $("#form-field-skorsten_total_all_sum_brutto").val(sumAllTotals(rq_VAT));
  });
  check_if_new_additional_product_appeared(0);
  $("#skorsten_save_button").on("click", function () {
    $("div#form-field-calc_single_summary").each(function () {
      if ($(this).text() == 0 || $(this).text() == "-") {
        alert("Twój arkusz zawiera puste kalkulacje!");
        return false;
      }
    });
  });

  //Making emails update properly by using trick
  $("#rq_menu_region").hover(function () {
    console.log("updating email");
    hovering_email_update();
  });

  $("#skorsten-acc-list").on("change", function () {
    $("#form-field-skorsten_calculation").html(empty_calculation_html);
    var temp_insides_title = $("#bdt-accordion-kalkulacja > span").eq(0);
    $("#bdt-accordion-kalkulacja").html("");
    $("#bdt-accordion-kalkulacja").append(temp_insides_title);
    $("#bdt-accordion-kalkulacja").html(
      $("#bdt-accordion-kalkulacja").html() + "Kalkulacja"
    );
    $("#form-field-calc_single_summary").text("-");
    $("#form-field-calc_single_summary_brutto").text("-");
    $("#form-field-calc_total_summary").text(sumAllTotals());
    $("#form-field-calc_total_summary_brutto").text(sumAllTotals(rq_VAT));
  });
  $("#skorsten_klient").on("click", function () {
    function already_loaded() {
      setTimeout(() => {
        var customer_iframe = $("iframe").contents();
        if (customer_iframe.find('input[value="Dodaj klienta"]').length == 0) {
          var active_customer_id = $("#form-field-selected_customer").val();
          rq_import_customers(active_customer_id);
        } else already_loaded();
      }, 1000);
    }
    function wait_for_it_to_load() {
      setTimeout(() => {
        var customer_iframe = $("iframe").contents();
        if (customer_iframe.find('input[value="Dodaj klienta"]').length)
          already_loaded();
        else wait_for_it_to_load();
      }, 500);
    }
    wait_for_it_to_load();
  });
  if ($("section[data-pafe-form-builder-repeater-id='rq_calc']").length > 1) {
    $(".elementor-element-ad383b6").show();
  } else {
    $(".elementor-element-ad383b6").hide();
  }
  $(document).on("click", function () {
    if ($("section[data-pafe-form-builder-repeater-id='rq_calc']").length > 1) {
      $(".elementor-element-ad383b6").show();
    } else {
      $(".elementor-element-ad383b6").hide();
    }
  });

  empty_calculation_html = $("#form-field-skorsten_calculation").html();
  empty_header_html = $("#skorsten_element_title > div > h1").html();
  if (document.getElementById("form-field-skorsten_system")) {
    addArrayToSelectStandard(
      systems_data["titles"],
      "form-field-skorsten_system"
    );
  }
  $("#form-field-skorsten_trojnik").on("change", function () {
    $("#form-field-skorsten_calculation").html(empty_calculation_html);
    var temp_insides_title = $("#bdt-accordion-kalkulacja > span").eq(0);
    $("#bdt-accordion-kalkulacja").html("");
    $("#bdt-accordion-kalkulacja").append(temp_insides_title);
    $("#bdt-accordion-kalkulacja").html(
      $("#bdt-accordion-kalkulacja").html() + "Kalkulacja"
    );
    $("#form-field-calc_single_summary").text("-");
    $("#form-field-calc_single_summary_brutto").text("-");
    $("#form-field-calc_total_summary").text(sumAllTotals());
    $("#form-field-calc_total_summary_brutto").text(sumAllTotals(rq_VAT));
  });
  $("#form-field-skorsten_pakiet_montazowy").on("change", function () {
    $("#form-field-skorsten_calculation").html(empty_calculation_html);
    var temp_insides_title = $("#bdt-accordion-kalkulacja > span").eq(0);
    $("#bdt-accordion-kalkulacja").html("");
    $("#bdt-accordion-kalkulacja").append(temp_insides_title);
    $("#bdt-accordion-kalkulacja").html(
      $("#bdt-accordion-kalkulacja").html() + "Kalkulacja"
    );
    $("#form-field-calc_single_summary").text("-");
    $("#form-field-calc_single_summary_brutto").text("-");
    $("#form-field-calc_total_summary").text(sumAllTotals());
    $("#form-field-calc_total_summary_brutto").text(sumAllTotals(rq_VAT));
    if (
      !empty(
        accessories_data[$("#form-field-skorsten_system").val()]["packets"][
          $("#form-field-skorsten_pakiet_montazowy").val()
        ]
      )
    ) {
      $("#rq_montaz_opis").text(
        accessories_data[$("#form-field-skorsten_system").val()]["packets"][
          $("#form-field-skorsten_pakiet_montazowy").val()
        ]["description"]
      );
    } else $("#rq_montaz_opis").text("");
  });
  $("#form-field-skorsten_system").on("change", function () {
    $("#rq_pick_srednica").text("Średnica");
    $("#rq_pick_wysokosc").text("Wysokość");
    $("#rq_pick_pustak").text("Typ pustaka");
    $("#form-field-calc_single_summary").text("-");
    $("#form-field-skorsten_calculation").html(empty_calculation_html);
    var temp_insides_title = $("#bdt-accordion-kalkulacja > span").eq(0);
    $("#bdt-accordion-kalkulacja").html("");
    $("#bdt-accordion-kalkulacja").append(temp_insides_title);
    $("#bdt-accordion-kalkulacja").html(
      $("#bdt-accordion-kalkulacja").html() + "Kalkulacja"
    );
    $("#form-field-calc_single_summary_brutto").text("-");
    $("#form-field-calc_total_summary").text(sumAllTotals());
    $("#form-field-calc_total_summary_brutto").text(sumAllTotals(rq_VAT));
    $("#rq_pick_produkt").text($("#form-field-skorsten_system").val());
    $(this).parents("div.elementor-row").find("#skorsten_akcesoria").hide(400);
    $(this)
      .parents("div.elementor-row")
      .find("#skorsten-acc-list")
      .children("div")
      .remove();
    //empty selection of srednica and system priv
    $("#form-field-skorsten_srednica").empty();
    $("#form-field-skorsten_pakiet_montazowy").empty();
    $("#form-field-skorsten_pakiet_montazowy").append(
      new Option("Podstawowy", null)
    );
    $("#skorsten_srednica").hide(400);
    $("#skorsten_trojnik").hide(400);
    $("#skorsten_packet").hide(400);
    //make sure that when you change system, hide
    $("#skorsten_wysokosc").hide(400);
    $("#skorsten_pustak").hide(400);
    $(this).parents("div.elementor-row").find("#skorsten_wylicz").hide(500);
    var selectedPacketsArray;
    if (
      typeof accessories_data[
        document.getElementById("form-field-skorsten_system").value
      ] !== "undefined"
    ) {
      if (
        typeof accessories_data[
          document.getElementById("form-field-skorsten_system").value
        ]["packets"] !== "undefined"
      ) {
        var selectedPacketsArray =
          accessories_data[
            document.getElementById("form-field-skorsten_system").value
          ]["packets"]["list"];
        if (
          selectedPacketsArray.includes("Podstawowy") ||
          selectedPacketsArray.includes("Pakiet podstawowy") ||
          selectedPacketsArray.includes("Pakiet Podstawowy")
        )
          $("#form-field-skorsten_pakiet_montazowy").empty();
        addArrayToSelectStandard(
          selectedPacketsArray,
          "form-field-skorsten_pakiet_montazowy"
        );
        $("#form-field-skorsten_pakiet_montazowy").trigger("change");
      }
    }
    if (
      document.getElementById("form-field-skorsten_system").value !=
      "SKORSTEN WENTYLACJA"
    ) {
      var selectedDiameterArray =
        systems_data[
          document.getElementById("form-field-skorsten_system").value
        ]["diameters"];
      if (
        document.getElementById("form-field-skorsten_system").value !=
        "SKORSTEN COMBO"
      )
        addArrayToSelectStandard(
          selectedDiameterArray,
          "form-field-skorsten_srednica"
        );
      else
        addArrayToSelectStandard_Combo(
          selectedDiameterArray,
          "form-field-skorsten_srednica"
        );
      $("#skorsten_srednica").show(400);
    } else {
      $("#form-field-skorsten_srednica").trigger("change");
      $("#form-field-skorsten_srednica").append(new Option());
      $("#rq_pick_srednica").text("BRAK");
    }
    //make first selection empty
    $("#form-field-skorsten_srednica").val("");

    //copy the text value to hidden input
    var system = $("#form-field-skorsten_system option:selected").text();
    if (system == "") {
      $("#form-field-skorsten_system_priv").val("brak");
    } else {
      $("#form-field-skorsten_system_priv").val(system);
    }

    //hide calc
    $("#skorsten_obliczenia").hide(400);
  });

  $("#form-field-skorsten_srednica").on("change", function () {
    $("#rq_pick_wysokosc").text("Wysokość");
    $("#rq_pick_pustak").text("Typ pustaka");
    $("#form-field-calc_single_summary").text("-");
    $("#form-field-calc_single_summary_brutto").text("-");
    $("#form-field-calc_total_summary").text(sumAllTotals());
    $("#form-field-calc_total_summary_brutto").text(sumAllTotals(rq_VAT));
    $("#form-field-skorsten_calculation").html(empty_calculation_html);
    var temp_insides_title = $("#bdt-accordion-kalkulacja > span").eq(0);
    $("#bdt-accordion-kalkulacja").html("");
    $("#bdt-accordion-kalkulacja").append(temp_insides_title);
    $("#bdt-accordion-kalkulacja").html(
      $("#bdt-accordion-kalkulacja").html() + "Kalkulacja"
    );
    if ($("#form-field-skorsten_srednica").val() != "")
      $("#rq_pick_srednica").text($("#form-field-skorsten_srednica").val());
    $(this).parents("div.elementor-row").find("#skorsten_akcesoria").hide(400);
    $(this)
      .parents("div.elementor-row")
      .find("#skorsten-acc-list")
      .children("div")
      .remove();
    $("#skorsten_trojnik").hide(400);
    $("#skorsten_packet").hide(400);
    $("#form-field-skorsten_trojnik").empty();
    $("#form-field-skorsten_trojnik").append(new Option("Trójnik 90", null));
    var selectedSplitterArray;
    if (
      typeof accessories_data[
        document.getElementById("form-field-skorsten_system").value
      ] !== "undefined"
    ) {
      if (
        typeof accessories_data[
          document.getElementById("form-field-skorsten_system").value
        ][document.getElementById("form-field-skorsten_srednica").value] !==
        "undefined"
      ) {
        if (
          typeof accessories_data[
            document.getElementById("form-field-skorsten_system").value
          ][document.getElementById("form-field-skorsten_srednica").value][
            "splitters"
          ] !== "undefined"
        ) {
          var selectedSplitterArray =
            accessories_data[
              document.getElementById("form-field-skorsten_system").value
            ][document.getElementById("form-field-skorsten_srednica").value][
              "splitters"
            ]["list"];
          addArrayToSelectStandard(
            selectedSplitterArray,
            "form-field-skorsten_trojnik"
          );
        }
      }
    }
    //empty selection of wysokosc
    $("#form-field-skorsten_wysokosc").empty();

    //make sure that when you change srednica, show wysokosc
    $("#skorsten_wysokosc").show(400);

    //make sure that when you change srednica, hide pustak
    $("#skorsten_pustak").hide(400);
    $(this).parents("div.elementor-row").find("#skorsten_wylicz").hide(500);

    if (
      document.getElementById("form-field-skorsten_system").value !=
      "SKORSTEN WENTYLACJA"
    ) {
      var selectedHeightArray =
        systems_data[
          document.getElementById("form-field-skorsten_system").value
        ][document.getElementById("form-field-skorsten_srednica").value][
          "heights"
        ];
      addArrayToSelectStandard(
        selectedHeightArray,
        "form-field-skorsten_wysokosc"
      );
    } else {
      var selectedHeightArray =
        systems_data[
          document.getElementById("form-field-skorsten_system").value
        ]["heights"];
      addArrayToSelectStandard(
        selectedHeightArray,
        "form-field-skorsten_wysokosc"
      );
    }

    //make first selection empty
    $("#form-field-skorsten_wysokosc").val("");

    //copy the text value to hidden input
    var diameter = $("#form-field-skorsten_srednica option:selected").text();
    $("#form-field-skorsten_srednica_priv").val(diameter);

    //hide calc
    $("#skorsten_obliczenia").hide(400);
  });

  $("#form-field-skorsten_wysokosc").on("change", function () {
    $("#rq_pick_pustak").text("Typ pustaka");
    $("#form-field-calc_single_summary").text("-");
    $("#form-field-calc_single_summary_brutto").text("-");
    $("#form-field-calc_total_summary").text(sumAllTotals());
    $("#form-field-calc_total_summary_brutto").text(sumAllTotals(rq_VAT));
    $("#form-field-skorsten_calculation").html(empty_calculation_html);
    var temp_insides_title = $("#bdt-accordion-kalkulacja > span").eq(0);
    $("#bdt-accordion-kalkulacja").html("");
    $("#bdt-accordion-kalkulacja").append(temp_insides_title);
    $("#bdt-accordion-kalkulacja").html(
      $("#bdt-accordion-kalkulacja").html() + "Kalkulacja"
    );
    $("#rq_pick_wysokosc").text($("#form-field-skorsten_wysokosc").val());
    $("#pustak_image_select").ddslick("destroy");
    $(this).parents("div.elementor-row").find("#skorsten_akcesoria").hide(400);
    $(this)
      .parents("div.elementor-row")
      .find("#skorsten-acc-list")
      .children("div")
      .remove();
    //empty selection of wysokosc
    $("#form-field-skorsten_pustak").empty();
    $("#skorsten_trojnik").hide(400);
    $("#skorsten_packet").hide(400);
    //make sure that when you change wysokosc, show pustak
    $("#skorsten_pustak").show(400);
    $(this).parents("div.elementor-row").find("#skorsten_wylicz").hide(500);
    if (
      document.getElementById("form-field-skorsten_system").value !=
      "SKORSTEN WENTYLACJA"
    ) {
      var selectedAirbrickArray =
        systems_data[
          document.getElementById("form-field-skorsten_system").value
        ][document.getElementById("form-field-skorsten_srednica").value][
          document.getElementById("form-field-skorsten_wysokosc").value
        ]["airbricks"];
      addArrayToSelectStandard(
        selectedAirbrickArray,
        "form-field-skorsten_pustak"
      );
      generate_select_from_airbricks(
        $("#pustak_image_select"),
        create_array_of_active_airbricks(selectedAirbrickArray),
        $("#bdt-accordion-kalkulacja").parents(".elementor-row")
      );
    } else {
      var selectedAirbrickArray =
        systems_data[
          document.getElementById("form-field-skorsten_system").value
        ][document.getElementById("form-field-skorsten_wysokosc").value][
          "airbricks"
        ];
      addArrayToSelectStandard(
        selectedAirbrickArray,
        "form-field-skorsten_pustak"
      );
      generate_select_from_airbricks(
        $("#pustak_image_select"),
        create_array_of_active_airbricks(selectedAirbrickArray),
        $("#bdt-accordion-kalkulacja").parents(".elementor-row")
      );
    }
    //make first selection empty
    $("#form-field-skorsten_pustak").val("");

    //copy the text value to hidden input
    var height = $("#form-field-skorsten_wysokosc option:selected").text();
    $("#form-field-skorsten_wysokosc_priv").val(height);

    //hide calc
    $("#skorsten_obliczenia").hide(400);
  });

  $("#form-field-skorsten_pustak").on("change", function () {
    $("#form-field-calc_single_summary").text("-");
    $("#form-field-calc_single_summary_brutto").text("-");
    $("#form-field-calc_total_summary").text(sumAllTotals());
    $("#form-field-calc_total_summary_brutto").text(sumAllTotals(rq_VAT));
    $("#form-field-skorsten_calculation").html(empty_calculation_html);
    var temp_insides_title = $("#bdt-accordion-kalkulacja > span").eq(0);
    $("#bdt-accordion-kalkulacja").html("");
    $("#bdt-accordion-kalkulacja").append(temp_insides_title);
    $("#bdt-accordion-kalkulacja").html(
      $("#bdt-accordion-kalkulacja").html() + "Kalkulacja"
    );
    $("#rq_pick_pustak").text($("#form-field-skorsten_pustak").val());
    //copy the text value to hidden input
    var pustak = $("#form-field-skorsten_pustak option:selected").text();
    $("#form-field-skorsten_pustak_priv").val(pustak);
    $(this).parents("div.elementor-row").find("#skorsten_wylicz").show(500);
    //hide calc
    $("#skorsten_obliczenia").hide(400);
    var trojnik_options_counter = 0;
    $(this)
      .parents("div.elementor-row")
      .find("#skorsten_trojnik option")
      .each(function () {
        trojnik_options_counter++;
      });
    var packet_options_counter = 0;
    $(this)
      .parents("div.elementor-row")
      .find("#skorsten_packet option")
      .each(function () {
        packet_options_counter++;
      });
    if (trojnik_options_counter > 1) $("#skorsten_trojnik").show(400);
    if (packet_options_counter > 1) $("#skorsten_packet").show(400);

    var system = $("#form-field-skorsten_system").val();
    var diameter = $("#form-field-skorsten_srednica").val();
    var pustak = $("#form-field-skorsten_pustak").val();
    $(this).parents("div.elementor-row").find("#skorsten_akcesoria").hide(400);
    $(this)
      .parents("div.elementor-row")
      .find("#skorsten-acc-list")
      .children("div")
      .remove();
    if (!empty(accessories_data[system])) {
      if (!empty(accessories_data[system])) {
        if (!empty(accessories_data[system][diameter])) {
          if (!empty(accessories_data[system][diameter][pustak])) {
            var selectedSystemAcc =
              accessories_data[system][diameter][pustak]["elements"];

            for (i = 0; i < selectedSystemAcc.length; i++) {
              //POPRAWIĆ INDEKSACJĘ

              var skorsten_single_acc_array =
                "<div class='skorsten-acc-single-element' id='skorsten-acc-single-element[" +
                [i] +
                "]' data-acc-id='" +
                selectedSystemAcc[i]["title"] +
                "' style='display: inline;'>" +
                "<label class='skorsten-acc-inline-label'>" +
                "<input type='checkbox' class='skorsten-acc-label' id='skorsten-acc-label[" +
                [i] +
                "]' value=''>" +
                selectedSystemAcc[i]["title"] +
                "</label>" +
                "<input type='number' id='skorsten_acc_amount[" +
                [i] +
                "]' class='skorsten_acc_amount' name='skorsten_acc_amount' value='" +
                selectedSystemAcc[i]["amount"] +
                "' min='" +
                selectedSystemAcc[i]["amount"] +
                "'>" +
                "<div class='skorsten-acc-price'>" +
                selectedSystemAcc[i]["unit_price"] +
                " zł</div>" +
                "</div>";

              $("#skorsten-acc-list").append(skorsten_single_acc_array);

              $("input[class='skorsten-acc-label']").on(
                "click change",
                function (e) {
                  $("#skorsten_obliczenia").hide(400);
                }
              );

              $("input[class='skorsten_acc_amount']").on(
                "click change",
                function (e) {
                  $("#skorsten_obliczenia").hide(400);
                }
              );
            }

            $("#skorsten_akcesoria").show(400);
          }
        }
      }
    }
  });

  $("#skorsten_wylicz").on("click", function () {
    $(this).parents("div.elementor-row").find("#skorsten_wylicz").hide(500);
    $(this).parents("div.elementor-row").find("#rq_button_loader").show(1000);
    var system = $("#form-field-skorsten_system").val();
    var system_name = $("#form-field-skorsten_system_priv").val();
    var diameter = $("#form-field-skorsten_srednica").val();
    var diameter_name = $("#form-field-skorsten_srednica_priv").val();
    var height = $("#form-field-skorsten_wysokosc").val();
    var height_name = $("#form-field-skorsten_wysokosc_priv").val();
    var pustak = $("#form-field-skorsten_pustak").val();
    var pustak_name = $("#form-field-skorsten_pustak_priv").val();
    var splitter = $("#form-field-skorsten_trojnik").val();
    var active_splitter_id;
    if (splitter != null && splitter != "" && splitter != "null")
      active_splitter_id =
        accessories_data[system][diameter]["splitters"][splitter]["id"];
    var packet = $("#form-field-skorsten_pakiet_montazowy").val();
    var active_packet_id;
    if (packet != null && packet != "" && packet != "null")
      active_packet_id = accessories_data[system]["packets"][packet]["id"];
    var accessories = [];
    var system_detail =
      system_name +
      " - " +
      "ø" +
      diameter_name +
      " - " +
      pustak_name.split(" ")[1] +
      " - " +
      height_name +
      " M";
    if (splitter != null && splitter != "" && splitter != "null") {
      system_detail += " - " + splitter;
    }
    $(this)
      .parents("div.elementor-row")
      .find("#form-field-skorsten_rabat")
      .val(0);
    $(this)
      .parents("div.elementor-row")
      .find("#skorsten_element_title > div > h1")
      .html(system_detail);
    $(this)
      .parents("div.elementor-row")
      .find("#form-field-skorsten_single_calc_name")
      .val(system_detail);
    var temp_insides = $(this)
      .parents("div.elementor-row")
      .find("#bdt-accordion-kalkulacja")
      .find("span");
    $(this)
      .parents("div.elementor-row")
      .find("#bdt-accordion-kalkulacja")
      .html("");
    $(this)
      .parents("div.elementor-row")
      .find("#bdt-accordion-kalkulacja")
      .append(temp_insides);
    $(this)
      .parents("div.elementor-row")
      .find("#bdt-accordion-kalkulacja")
      .html(
        $(this)
          .parents("div.elementor-row")
          .find("#bdt-accordion-kalkulacja")
          .html() + system_detail
      );

    $("#form-field-skorsten_amount").val(1);
    if ($("#skorsten-acc-list").html() !== "") {
      var list_length = $("#skorsten-acc-list > div").length;
      for (i = 0; i < list_length; i++) {
        var acc_checkbox = "#skorsten-acc-label\\[" + i + "\\]";

        if (
          $($(this).parents("div.elementor-row").find(acc_checkbox)).prop(
            "checked"
          )
        ) {
          var acc_id_id =
            "div[id='skorsten-acc-single-element\\[" + i + "\\]']";
          var acc_id = $(acc_id_id).data("accId");

          var acc_id_amount = "input[id='skorsten_acc_amount\\[" + i + "\\]']";
          var acc_amount = $(acc_id_amount).val();

          var acc_single_array = [acc_id, acc_amount];
          accessories.push(acc_single_array);
        }
      }
    }

    debug_table.push($(this));
    var table_selector = $(this)
      .parents("div.elementor-row")
      .find("#form-field-skorsten_calculation");
    rq_systems_data_ask_server(
      system,
      diameter,
      height,
      pustak,
      accessories,
      active_splitter_id,
      active_packet_id,
      table_selector
    );
  });

  $("#skorsten_wyslij").on("click", function () {
    $(".skorsten_mail_send").toggle(600);
    var calcTable = $("div#form-field-skorsten_calculation").html();
    var clearingTable = $.parseHTML(calcTable);
    $(clearingTable)
      .find("*")
      .each(function () {
        if ($(this).css("display") == "none") {
          $(this).remove();
        }
      });
    var cleartable_html = `<table>${$(clearingTable)
      .eq($(clearingTable).length - 1)
      .html()}</table>`;
    $("input#form-field-skorsten_table_mail").eq(1).val(cleartable_html);
  });
  $("#form-field-skorsten_send_email_button, #skorsten_wyslij").on(
    "click",
    hovering_email_update()
  );
  $("#skorsten_druk").on("click", function () {
    // OLD NOT OPTIMAL SOLUTION
    /*
    //select thing to print
    var printSelector = document.getElementsByClassName("rq_calculation");
    $(".bdt-accordion-content").attr("style", "display: block !important;");
    var printWindow = window.open(
      "https://skorstentransfer.essin.pl/skorsten-kalkulator/printTemplate.html",
      "Print Window",
      "width=" +
        printSelector[0].clientWidth +
        ",height=" +
        printSelector[0].clientHeight
    );
    window.scrollTo(0, 0);
    document.body.style.position = "fixed";
    document.body.style.display = "block";
    printWindow.onload = function () {
      var k;
      for (k = 0; k < printSelector.length; k++) {
        var html2canvas_selector = printSelector[k];

        html2canvas(html2canvas_selector).then((canvas) => {
          printWindow.document.getElementById("loading").style.display = "none";
          printWindow.document.getElementById("printButton").style.display =
            "block";
          canvas.style.width = "210mm";
          canvas.style.height = "260mm";
          canvas.style.objectFit = "contain";
          printWindow.document
            .getElementById("calculations")
            .appendChild(canvas);
        });
        if (k == printSelector.length - 1) {
          document.body.style.position = "static";

          $(".bdt-accordion-content").attr("style", "");
          if ($("#form-field-skorsten_logout_print").val() != "")
            printWindow.document.getElementById(
              "customer_print_data"
            ).innerHTML = $("#form-field-skorsten_logout_print")
              .val()
              .replace(/\n\r?/g, "<br />");
          //printWindow.print();
        }
      }
      //Do zrobienia druk akcesoriów single_element_section
      //single_elements_total_section
    };
    */
    $("div#rq_col_1").hide(0);
    $("div#rq_hid").hide(0);
    $("#rq_menu_region").hide(0);
    $("#bdt-accordion-podsumowanie").hide(0);
    $("#footer").hide(0);
    $("#site-header").hide(0);
    $("#wpadminbar").hide(0);
    $("i").hide(0);
    window.print();
    $("div#rq_col_1").show(0);
    $("div#rq_hid").show(0);
    $("#rq_menu_region").show(0);
    $("#bdt-accordion-podsumowanie").show(0);
    $("#footer").show(0);
    $("#site-header").show(0);
    $("#wpadminbar").show(0);
    $("i").show(0);
  });

  $("#rq_elementy_zestawu_accordion, #rq_skorsten_accessories_accordion").on(
    "click",
    function () {
      //FIX FOR NOT WORKING NESTED ACCORDIN
      $(this).find(".bdt-accordion-icon-closed > i").css("color", "#7A7A7A");

      if ($(this).find(".bdt-accordion-icon-closed").css("display") == "none")
        $(this).find(".bdt-accordion-icon-closed").show(0);
      else $(this).find(".bdt-accordion-icon-closed").hide(0);

      if ($(this).find(".bdt-accordion-icon-opened").css("display") == "none")
        $(this).find(".bdt-accordion-icon-opened").show(0);
      else $(this).find(".bdt-accordion-icon-opened").hide(0);
    }
  );
  $("#rq_additional_products_switch").on("click", function () {
    function check_if_display_is_not_none() {
      setTimeout(() => {
        if ($("#single_element_section_id").css("display") != "none")
          document.getElementById("single_element_section_id").scrollIntoView();
        else check_if_display_is_not_none();
      }, 200);
    }
    check_if_display_is_not_none();
  });
}
$("div[data-pafe-form-builder-repeater-trigger-action='add']")
  .eq(0)
  .on("click", function () {
    $("div#skorsten_element_title")
      .last()
      .on("click", function () {
        var placeholder;
      });
    onClickSystemWatch();
    function onClickSystemWatch() {
      var previous_length = $(
        "section[data-pafe-form-builder-repeater-id='rq_calc']"
      ).length;
      setTimeout(() => {
        if (
          $("section[data-pafe-form-builder-repeater-id='rq_calc']").length !=
          previous_length
        )
          onClickNewSystem();
        else onClickSystemWatch();
      }, 200);
    }
    function onClickNewSystem() {
      checkForNiceNumberEventListener_refresh();
      hideAllCalculations(400);
      $("span#bdt-accordion-kalkulacja").eq(-2).click();
      if ($("span#bdt-accordion-kalkulacja").length > 2)
        $("span#bdt-accordion-kalkulacja").eq(-1).click();
      $("div#skorsten_element_title")
        .last()
        .on("click", function () {
          showAllCalculations();
        });
      var activeContainer = $(
        "section[data-pafe-form-builder-repeater-id='rq_calc']"
      ).last();
      //timeout is here because PAFE scripts were overriding our thigy
      setTimeout(() => {
        var temp_insides = activeContainer
          .find("#bdt-accordion-kalkulacja")
          .find("span")
          .eq(0);
        activeContainer.find("#bdt-accordion-kalkulacja").html("");
        activeContainer.find("#bdt-accordion-kalkulacja").append(temp_insides);
        activeContainer
          .find("#bdt-accordion-kalkulacja")
          .html(
            activeContainer.find("#bdt-accordion-kalkulacja").html() +
              "Kalkulacja"
          );
      }, 300);
      activeContainer.find("#form-field-calc_single_summary").text("-");
      activeContainer.find("#form-field-calc_single_summary_brutto").text("-");
      $("#form-field-calc_total_summary").text(sumAllTotals());
      $("#form-field-calc_total_summary_brutto").text(sumAllTotals(rq_VAT));
      activeContainer
        .find("#skorsten_element_title > div > h1")
        .html(empty_header_html);
      activeContainer.find("#form-field-skorsten_single_calc_name").val(null);
      activeContainer
        .find("#form-field-skorsten_calculation")
        .html(empty_calculation_html);
      var temp_insides_title = activeContainer
        .find("#bdt-accordion-kalkulacja")
        .find("span")
        .eq(0);
      activeContainer.find("#bdt-accordion-kalkulacja").html("");
      activeContainer
        .find("#bdt-accordion-kalkulacja")
        .append(temp_insides_title);
      activeContainer
        .find("#bdt-accordion-kalkulacja")
        .html($("#bdt-accordion-kalkulacja").html() + "Kalkulacja");
      activeContainer.find("#form-field-calc_single_summary").text("-");
      activeContainer.find("#form-field-calc_single_summary_brutto").text("-");
      activeContainer.find("#skorsten_akcesoria").hide(400);
      activeContainer.find("#skorsten-acc-list").children("div").remove();
      activeContainer.find("#form-field-skorsten_srednica").empty();
      activeContainer.find("#form-field-skorsten_wysokosc").empty();
      activeContainer.find("#form-field-skorsten_pustak").empty();
      activeContainer.find("#form-field-skorsten_trojnik").empty();
      activeContainer.find("#pustak_image_select").ddslick("destroy");
      activeContainer.find("#rq_pick_produkt").text("System Skorsten");
      activeContainer.find("#rq_pick_srednica").text("Średnica");
      activeContainer.find("#rq_pick_wysokosc").text("Wysokość");
      activeContainer.find("#rq_pick_pustak").text("Typ pustaka");

      //FIX FOR ELEMENTOR TABS IN REPEATER
      activeContainer
        .find(".elementor-toggle-item")
        .on("click", function (event) {
          event.preventDefault();
          $(this).find(".elementor-tab-content").toggle(400);
          if (
            !$(this).find(".elementor-tab-title").hasClass("elementor-active")
          )
            $(this).find(".elementor-tab-title").addClass("elementor-active");
          else
            $(this)
              .find(".elementor-tab-title")
              .removeClass("elementor-active");
        });

      activeContainer.find("#skorsten-acc-list").on("change", function () {
        activeContainer
          .find("#form-field-skorsten_calculation")
          .html(empty_calculation_html);
        var temp_insides_title = activeContainer
          .find("#bdt-accordion-kalkulacja > span")
          .eq(0);
        activeContainer.find("#bdt-accordion-kalkulacja").html("");
        activeContainer
          .find("#bdt-accordion-kalkulacja")
          .append(temp_insides_title);
        activeContainer
          .find("#bdt-accordion-kalkulacja")
          .html(
            activeContainer.find("#bdt-accordion-kalkulacja").html() +
              "Kalkulacja"
          );
        activeContainer.find("#form-field-calc_single_summary").text("-");
        activeContainer
          .find("#form-field-calc_single_summary_brutto")
          .text("-");
        activeContainer
          .find("#form-field-calc_total_summary")
          .text(sumAllTotals());
        activeContainer
          .find("#form-field-calc_total_summary_brutto")
          .text(sumAllTotals(rq_VAT));
      });

      activeContainer
        .find("#form-field-skorsten_trojnik")
        .on("change", function () {
          activeContainer
            .find("#form-field-skorsten_calculation")
            .html(empty_calculation_html);
          var temp_insides_title = activeContainer
            .find("#bdt-accordion-kalkulacja")
            .find("span")
            .eq(0);
          activeContainer.find("#bdt-accordion-kalkulacja").html("");
          activeContainer
            .find("#bdt-accordion-kalkulacja")
            .append(temp_insides_title);
          activeContainer
            .find("#bdt-accordion-kalkulacja")
            .html($("#bdt-accordion-kalkulacja").html() + "Kalkulacja");
          activeContainer.find("#form-field-calc_single_summary").text("-");
          activeContainer
            .find("#form-field-calc_single_summary_brutto")
            .text("-");
          $("#form-field-calc_total_summary").text(sumAllTotals());
          $("#form-field-calc_total_summary_brutto").text(sumAllTotals(rq_VAT));
        });

      activeContainer
        .find("#form-field-skorsten_pakiet_montazowy")
        .on("change", function () {
          activeContainer
            .find("#form-field-skorsten_calculation")
            .html(empty_calculation_html);
          var temp_insides_title = activeContainer
            .find("#bdt-accordion-kalkulacja")
            .find("span")
            .eq(0);
          activeContainer.find("#bdt-accordion-kalkulacja").html("");
          activeContainer
            .find("#bdt-accordion-kalkulacja")
            .append(temp_insides_title);
          activeContainer
            .find("#bdt-accordion-kalkulacja")
            .html($("#bdt-accordion-kalkulacja").html() + "Kalkulacja");
          activeContainer.find("#form-field-calc_single_summary").text("-");
          activeContainer
            .find("#form-field-calc_single_summary_brutto")
            .text("-");
          $("#form-field-calc_total_summary").text(sumAllTotals());
          $("#form-field-calc_total_summary_brutto").text(sumAllTotals(rq_VAT));
          if (
            !empty(
              accessories_data[
                activeContainer.find("#form-field-skorsten_system").val()
              ]["packets"][
                activeContainer
                  .find("#form-field-skorsten_pakiet_montazowy")
                  .val()
              ]
            )
          ) {
            activeContainer
              .find("#rq_montaz_opis")
              .text(
                accessories_data[
                  activeContainer.find("#form-field-skorsten_system").val()
                ]["packets"][
                  activeContainer
                    .find("#form-field-skorsten_pakiet_montazowy")
                    .val()
                ]["description"]
              );
          } else {
            activeContainer.find("#rq_montaz_opis").text("");
          }
        });
      activeContainer
        .find("#form-field-skorsten_system")
        .on("change", function () {
          activeContainer.find("#rq_pick_srednica").text("Średnica");
          activeContainer.find("#rq_pick_wysokosc").text("Wysokość");
          activeContainer.find("#rq_pick_pustak").text("Typ pustaka");
          activeContainer
            .find("#rq_pick_produkt")
            .text(activeContainer.find("#form-field-skorsten_system").val());
          activeContainer
            .find("#form-field-skorsten_calculation")
            .html(empty_calculation_html);
          var temp_insides_title = activeContainer
            .find("#bdt-accordion-kalkulacja")
            .find("span")
            .eq(0);
          activeContainer.find("#bdt-accordion-kalkulacja").html("");
          activeContainer
            .find("#bdt-accordion-kalkulacja")
            .append(temp_insides_title);
          activeContainer
            .find("#bdt-accordion-kalkulacja")
            .html($("#bdt-accordion-kalkulacja").html() + "Kalkulacja");
          activeContainer.find("#form-field-calc_single_summary").text("-");
          activeContainer
            .find("#form-field-calc_single_summary_brutto")
            .text("-");
          $("#form-field-calc_total_summary").text(sumAllTotals());
          $("#form-field-calc_total_summary_brutto").text(sumAllTotals(rq_VAT));
          activeContainer
            .find("#rq_pick_system")
            .text(activeContainer.find("#form-field-skorsten_system").val());
          activeContainer.find("#form-field-skorsten_pakiet_montazowy").empty();
          activeContainer
            .find("#form-field-skorsten_pakiet_montazowy")
            .append(new Option("Podstawowy", null));
          activeContainer.find("#skorsten_akcesoria").hide(400);
          activeContainer.find("#skorsten-acc-list").children("div").remove();
          //empty selection of srednica and system priv
          activeContainer.find("#form-field-skorsten_srednica").empty();
          activeContainer.find("#skorsten_trojnik").hide(400);
          activeContainer.find("#skorsten_packet").hide(400);
          activeContainer.find("#skorsten_srednica").hide(400);
          //make sure that when you change system, hide
          activeContainer.find("#skorsten_wysokosc").hide(400);
          activeContainer.find("#skorsten_pustak").hide(400);
          activeContainer.find("#skorsten_wylicz").hide(500);
          /* var selectedDiameterArray = systems_data[activeContainer.find("#form-field-skorsten_system").val()]['diameters'];
                addArrayToSelectStandard(selectedDiameterArray, "form-field-skorsten_srednica"); */
          var selectedPacketsArray;
          if (
            typeof accessories_data[
              activeContainer.find("#form-field-skorsten_system").val()
            ] !== "undefined"
          ) {
            if (
              typeof accessories_data[
                activeContainer.find("#form-field-skorsten_system").val()
              ]["packets"] !== "undefined"
            ) {
              var selectedPacketsArray =
                accessories_data[
                  activeContainer.find("#form-field-skorsten_system").val()
                ]["packets"]["list"];
              if (
                selectedPacketsArray.includes("Podstawowy") ||
                selectedPacketsArray.includes("Pakiet podstawowy") ||
                selectedPacketsArray.includes("Pakiet Podstawowy")
              )
                activeContainer
                  .find("#form-field-skorsten_pakiet_montazowy")
                  .empty();
              addArrayToSelectJQuery(
                selectedPacketsArray,
                activeContainer.find("#form-field-skorsten_pakiet_montazowy")
              );
              activeContainer
                .find("#form-field-skorsten_pakiet_montazowy")
                .trigger("change");
            }
          }
          if (
            activeContainer.find("#form-field-skorsten_system").val() !=
            "SKORSTEN WENTYLACJA"
          ) {
            var selectedDiameterArray =
              systems_data[
                activeContainer.find("#form-field-skorsten_system").val()
              ]["diameters"];
            if (
              activeContainer.find("#form-field-skorsten_system").val() !=
              "SKORSTEN COMBO"
            ) {
              addArrayToSelectJQuery(
                selectedDiameterArray,
                activeContainer.find("#form-field-skorsten_srednica")
              );
            } else
              addArrayToSelectJQuery_Combo(
                selectedDiameterArray,
                activeContainer.find("#form-field-skorsten_srednica")
              );
            activeContainer.find("#skorsten_srednica").show(400);
          } else {
            activeContainer
              .find("#form-field-skorsten_srednica")
              .trigger("change");
            activeContainer
              .find("#form-field-skorsten_srednica")
              .append(new Option());
            activeContainer.find("#rq_pick_srednica").text("BRAK");
          }
          //make first selection empty
          activeContainer.find("#form-field-skorsten_srednica").val("");

          //copy the text value to hidden input
          var system = activeContainer
            .find("#form-field-skorsten_system option:selected")
            .text();
          if (system == "") {
            activeContainer
              .find("#form-field-skorsten_system_priv")
              .val("brak");
          } else {
            activeContainer
              .find("#form-field-skorsten_system_priv")
              .val(system);
          }

          //hide calc
          activeContainer.find("#skorsten_obliczenia").hide(400);
        });
      activeContainer
        .find("#form-field-skorsten_srednica")
        .on("change", function () {
          activeContainer.find("#rq_pick_wysokosc").text("Wysokość");
          activeContainer.find("#rq_pick_pustak").text("Typ pustaka");
          activeContainer
            .find("#form-field-skorsten_calculation")
            .html(empty_calculation_html);
          var temp_insides_title = activeContainer
            .find("#bdt-accordion-kalkulacja")
            .find("span")
            .eq(0);
          activeContainer.find("#bdt-accordion-kalkulacja").html("");
          activeContainer
            .find("#bdt-accordion-kalkulacja")
            .append(temp_insides_title);
          activeContainer
            .find("#bdt-accordion-kalkulacja")
            .html($("#bdt-accordion-kalkulacja").html() + "Kalkulacja");
          activeContainer.find("#form-field-calc_single_summary").text("-");
          activeContainer
            .find("#form-field-calc_single_summary_brutto")
            .text("-");
          $("#form-field-calc_total_summary").text(sumAllTotals());
          $("#form-field-calc_total_summary_brutto").text(sumAllTotals(rq_VAT));
          if (activeContainer.find("#form-field-skorsten_srednica").val() != "")
            activeContainer
              .find("#rq_pick_srednica")
              .text(
                activeContainer.find("#form-field-skorsten_srednica").val()
              );
          activeContainer.find("#skorsten_akcesoria").hide(400);
          activeContainer.find("#skorsten-acc-list").children("div").remove();
          //empty selection of wysokosc
          activeContainer.find("#form-field-skorsten_wysokosc").empty();

          //make sure that when you change srednica, show wysokosc
          activeContainer.find("#skorsten_wysokosc").show(400);

          //make sure that when you change srednica, hide pustak
          activeContainer.find("#skorsten_pustak").hide(400);
          activeContainer.find("#skorsten_wylicz").hide(500);
          activeContainer.find("#skorsten_trojnik").hide(400);
          activeContainer.find("#skorsten_packet").hide(400);
          activeContainer.find("#form-field-skorsten_trojnik").empty();
          activeContainer
            .find("#form-field-skorsten_trojnik")
            .append(new Option("Trójnik 90", null));
          var selectedSplitterArray;
          if (
            typeof accessories_data[
              activeContainer.find("#form-field-skorsten_system").val()
            ] !== "undefined"
          ) {
            if (
              typeof accessories_data[
                activeContainer.find("#form-field-skorsten_system").val()
              ][activeContainer.find("#form-field-skorsten_srednica").val()] !==
              "undefined"
            ) {
              if (
                typeof accessories_data[
                  activeContainer.find("#form-field-skorsten_system").val()
                ][activeContainer.find("#form-field-skorsten_srednica").val()][
                  "splitters"
                ] !== "undefined"
              ) {
                var selectedSplitterArray =
                  accessories_data[
                    activeContainer.find("#form-field-skorsten_system").val()
                  ][
                    activeContainer.find("#form-field-skorsten_srednica").val()
                  ]["splitters"]["list"];
                addArrayToSelectJQuery(
                  selectedSplitterArray,
                  activeContainer.find("#form-field-skorsten_trojnik")
                );
              }
            }
          }
          if (
            activeContainer.find("#form-field-skorsten_system").val() !=
            "SKORSTEN WENTYLACJA"
          ) {
            var selectedHeightArray =
              systems_data[
                activeContainer.find("#form-field-skorsten_system").val()
              ][activeContainer.find("#form-field-skorsten_srednica").val()][
                "heights"
              ];
            addArrayToSelectJQuery(
              selectedHeightArray,
              activeContainer.find("#form-field-skorsten_wysokosc")
            );
          } else {
            var selectedHeightArray =
              systems_data[
                activeContainer.find("#form-field-skorsten_system").val()
              ]["heights"];
            addArrayToSelectJQuery(
              selectedHeightArray,
              activeContainer.find("#form-field-skorsten_wysokosc")
            );
          }

          //make first selection empty
          activeContainer.find("#form-field-skorsten_wysokosc").val("");

          //copy the text value to hidden input
          var diameter = activeContainer
            .find("#form-field-skorsten_srednica option:selected")
            .text();
          activeContainer
            .find("#form-field-skorsten_srednica_priv")
            .val(diameter);

          //hide calc
          activeContainer.find("#skorsten_obliczenia").hide(400);
        });
      activeContainer
        .find("#form-field-skorsten_wysokosc")
        .on("change", function () {
          activeContainer.find("#rq_pick_pustak").text("Typ pustaka");
          activeContainer
            .find("#form-field-skorsten_calculation")
            .html(empty_calculation_html);
          var temp_insides_title = activeContainer
            .find("#bdt-accordion-kalkulacja")
            .find("span")
            .eq(0);
          activeContainer.find("#bdt-accordion-kalkulacja").html("");
          activeContainer
            .find("#bdt-accordion-kalkulacja")
            .append(temp_insides_title);
          activeContainer
            .find("#bdt-accordion-kalkulacja")
            .html($("#bdt-accordion-kalkulacja").html() + "Kalkulacja");
          activeContainer.find("#form-field-calc_single_summary").text("-");
          activeContainer
            .find("#form-field-calc_single_summary_brutto")
            .text("-");
          $("#form-field-calc_total_summary").text(sumAllTotals());
          $("#form-field-calc_total_summary_brutto").text(sumAllTotals(rq_VAT));
          activeContainer
            .find("#rq_pick_wysokosc")
            .text(activeContainer.find("#form-field-skorsten_wysokosc").val());
          activeContainer.find("#skorsten_akcesoria").hide(400);
          activeContainer.find("#skorsten-acc-list").children("div").remove();
          //empty selection of wysokosc
          activeContainer.find("#form-field-skorsten_pustak").empty();
          activeContainer.find("#pustak_image_select").ddslick("destroy");

          //make sure that when you change wysokosc, show pustak
          activeContainer.find("#skorsten_pustak").show(400);
          activeContainer.find("#skorsten_wylicz").hide(500);

          activeContainer.find("#skorsten_trojnik").hide(400);
          activeContainer.find("#skorsten_packet").hide(400);
          if (
            activeContainer.find("#form-field-skorsten_system").val() !=
            "SKORSTEN WENTYLACJA"
          ) {
            var selectedAirbrickArray =
              systems_data[
                activeContainer.find("#form-field-skorsten_system").val()
              ][activeContainer.find("#form-field-skorsten_srednica").val()][
                activeContainer.find("#form-field-skorsten_wysokosc").val()
              ]["airbricks"];
            addArrayToSelectJQuery(
              selectedAirbrickArray,
              activeContainer.find("#form-field-skorsten_pustak")
            );
            generate_select_from_airbricks(
              activeContainer.find("#pustak_image_select"),
              create_array_of_active_airbricks(selectedAirbrickArray),
              activeContainer
            );
          } else {
            var selectedAirbrickArray =
              systems_data[
                activeContainer.find("#form-field-skorsten_system").val()
              ][activeContainer.find("#form-field-skorsten_wysokosc").val()][
                "airbricks"
              ];
            addArrayToSelectJQuery(
              selectedAirbrickArray,
              activeContainer.find("#form-field-skorsten_pustak")
            );
            generate_select_from_airbricks(
              activeContainer.find("#pustak_image_select"),
              create_array_of_active_airbricks(selectedAirbrickArray),
              activeContainer
            );
          }

          //make first selection empty
          activeContainer.find("#form-field-skorsten_pustak").val("");

          //copy the text value to hidden input
          var height = activeContainer
            .find("#form-field-skorsten_wysokosc option:selected")
            .text();
          activeContainer
            .find("#form-field-skorsten_wysokosc_priv")
            .val(height);

          //hide calc
          activeContainer.find("#skorsten_obliczenia").hide(400);
        });
      activeContainer
        .find("#form-field-skorsten_pustak")
        .on("change", function () {
          activeContainer
            .find("#form-field-skorsten_calculation")
            .html(empty_calculation_html);
          activeContainer.find("#form-field-calc_single_summary").text("-");
          activeContainer
            .find("#form-field-calc_single_summary_brutto")
            .text("-");
          $("#form-field-calc_total_summary").text(sumAllTotals());
          $("#form-field-calc_total_summary_brutto").text(sumAllTotals(rq_VAT));
          activeContainer
            .find("#rq_pick_pustak")
            .text(activeContainer.find("#form-field-skorsten_pustak").val());
          //copy the text value to hidden input
          var pustak = activeContainer
            .find("#form-field-skorsten_pustak option:selected")
            .text();

          activeContainer.find("#form-field-skorsten_pustak_priv").val(pustak);
          activeContainer.find("#skorsten_wylicz").show(500);
          //hide calc
          activeContainer.find("#skorsten_obliczenia").hide(400);

          var trojnik_options_counter = 0;
          activeContainer.find("#skorsten_trojnik option").each(function () {
            trojnik_options_counter++;
          });
          var packet_options_counter = 0;
          activeContainer.find("#skorsten_packet option").each(function () {
            packet_options_counter++;
          });
          if (trojnik_options_counter > 1)
            activeContainer.find("#skorsten_trojnik").show(400);
          if (packet_options_counter > 1)
            activeContainer.find("#skorsten_packet").show(400);

          var system = activeContainer
            .find("#form-field-skorsten_system")
            .val();
          var diameter = activeContainer
            .find("#form-field-skorsten_srednica")
            .val();
          var pustak = activeContainer
            .find("#form-field-skorsten_pustak")
            .val();

          activeContainer.find("#skorsten_akcesoria").hide(400);
          activeContainer.find("#skorsten-acc-list").children("div").remove();
          if (!empty(accessories_data[system])) {
            if (!empty(accessories_data[system])) {
              if (!empty(accessories_data[system][diameter])) {
                if (!empty(accessories_data[system][diameter][pustak])) {
                  var selectedSystemAcc =
                    accessories_data[system][diameter][pustak]["elements"];

                  for (i = 0; i < selectedSystemAcc.length; i++) {
                    //POPRAWIĆ INDEKSACJĘ
                    var skorsten_single_acc_array =
                      "<div class='skorsten-acc-single-element' id='skorsten-acc-single-element[" +
                      [i] +
                      "]' data-acc-id='" +
                      selectedSystemAcc[i]["title"] +
                      "' style='display: inline;'>" +
                      "<label class='skorsten-acc-inline-label'>" +
                      "<input type='checkbox' class='skorsten-acc-label' id='skorsten-acc-label[" +
                      [i] +
                      "]' value=''>" +
                      selectedSystemAcc[i]["title"] +
                      "</label>" +
                      "<input type='number' id='skorsten_acc_amount[" +
                      [i] +
                      "]' class='skorsten_acc_amount' name='skorsten_acc_amount' value='" +
                      selectedSystemAcc[i]["amount"] +
                      "' min='" +
                      selectedSystemAcc[i]["amount"] +
                      "'>" +
                      "<div class='skorsten-acc-price'>" +
                      selectedSystemAcc[i]["unit_price"] +
                      " zł</div>" +
                      "</div>";

                    activeContainer
                      .find("#skorsten-acc-list")
                      .append(skorsten_single_acc_array);

                    activeContainer
                      .find("input[class='skorsten-acc-label']")
                      .on("click change", function (e) {
                        activeContainer.find("#skorsten_obliczenia").hide(400);
                      });

                    activeContainer
                      .find("input[class='skorsten_acc_amount']")
                      .on("click change", function (e) {
                        activeContainer.find("#skorsten_obliczenia").hide(400);
                      });
                  }

                  activeContainer.find("#skorsten_akcesoria").show(400);
                }
              }
            }
          }
        });
      activeContainer.find("#skorsten_wylicz").on("click", function () {
        activeContainer.find("#skorsten_wylicz").hide(500);
        activeContainer.find("#rq_button_loader").show(1000);
        var system = activeContainer.find("#form-field-skorsten_system").val();
        var system_name = activeContainer
          .find("#form-field-skorsten_system_priv")
          .val();
        var diameter = activeContainer
          .find("#form-field-skorsten_srednica")
          .val();
        var diameter_name = activeContainer
          .find("#form-field-skorsten_srednica_priv")
          .val();
        var height = activeContainer
          .find("#form-field-skorsten_wysokosc")
          .val();
        var height_name = activeContainer
          .find("#form-field-skorsten_wysokosc_priv")
          .val();
        var pustak = activeContainer.find("#form-field-skorsten_pustak").val();
        var pustak_name = activeContainer
          .find("#form-field-skorsten_pustak_priv")
          .val();
        var splitter = activeContainer
          .find("#form-field-skorsten_trojnik")
          .val();
        var active_splitter_id;
        if (splitter != null && splitter != "" && splitter != "null")
          active_splitter_id =
            accessories_data[system][diameter]["splitters"][splitter]["id"];
        var packet = activeContainer
          .find("#form-field-skorsten_pakiet_montazowy")
          .val();
        var active_packet_id;
        if (packet != null && packet != "" && packet != "null")
          active_packet_id = accessories_data[system]["packets"][packet]["id"];
        var accessories = [];
        if (pustak_name.search(/wentylacyjny/i)) {
          pustak_name = pustak_name.replace(/wentylacyjny/i, "");
          pustak_name = pustak_name.replace(/\s\s+/g, " ");
        }
        var system_detail =
          system_name +
          " - " +
          "ø" +
          diameter_name +
          " - " +
          pustak_name.split(" ")[1] +
          " - " +
          height_name +
          " M";
        if (splitter != null && splitter != "" && splitter != "null") {
          system_detail += " - " + splitter;
        }
        activeContainer.find("#form-field-skorsten_rabat").val(0);
        activeContainer
          .find("#skorsten_element_title > div > h1")
          .html(system_detail);
        activeContainer
          .find("#form-field-skorsten_single_calc_name")
          .val(system_detail);
        var temp_insides = activeContainer.find(
          "#bdt-accordion-kalkulacja > span"
        );
        activeContainer.find("#bdt-accordion-kalkulacja").html("");
        activeContainer.find("#bdt-accordion-kalkulacja").append(temp_insides);
        activeContainer
          .find("#bdt-accordion-kalkulacja")
          .html(
            activeContainer.find("#bdt-accordion-kalkulacja").html() +
              system_detail
          );

        activeContainer.find("#form-field-skorsten_amount").val(1);
        if (activeContainer.find("#skorsten-acc-list").html() !== "") {
          var list_length = activeContainer.find("#skorsten-acc-list > div")
            .length;
          for (i = 0; i < list_length; i++) {
            var acc_checkbox = "#skorsten-acc-label\\[" + i + "\\]";

            //DO NAPRAW
            if (activeContainer.find(acc_checkbox).prop("checked")) {
              var acc_id_id =
                "div[id='skorsten-acc-single-element\\[" + i + "\\]']";
              var acc_id = activeContainer.find(acc_id_id).data("accId");

              var acc_id_amount =
                "input[id='skorsten_acc_amount\\[" + i + "\\]']";
              var acc_amount = activeContainer.find(acc_id_amount).val();

              var acc_single_array = [acc_id, acc_amount];
              accessories.push(acc_single_array);
            }
          }
        }
        var table_selector = activeContainer.find(
          "#form-field-skorsten_calculation"
        );
        rq_systems_data_ask_server(
          system,
          diameter,
          height,
          pustak,
          accessories,
          active_splitter_id,
          active_packet_id,
          table_selector
        );
      });
      activeContainer
        .find(
          "#form-field-skorsten_price_change, #form-field-skorsten_rabat_change"
        )
        .on("click keypress", function () {
          var discount = parseFloat(
            activeContainer.find("#form-field-skorsten_rabat").val()
          );
          var discount_multiplicator = 1 - discount / 100;
          var current_total_single_system = parseFloat(
            activeContainer.find("#rq_single_price").data("singlePrice")
          );
          if (
            !isNaN(
              parseFloat(
                activeContainer.find("#rq_acc_price").data("acc-price")
              )
            )
          )
            current_total_single_system += parseFloat(
              activeContainer.find("#rq_acc_price").data("acc-price")
            );
          current_total_single_system =
            current_total_single_system * discount_multiplicator;
          var multipliactor = activeContainer
            .find("#form-field-skorsten_amount")
            .val();
          var multi_total_price_system =
            current_total_single_system * multipliactor;
          var format =
            current_total_single_system.toFixed(2) +
            "[1]/" +
            multi_total_price_system.toFixed(2) +
            "[" +
            multipliactor +
            "]";

          if (multipliactor > 1) {
            activeContainer.find("#rq_single_price > b").html(format);
          } else {
            activeContainer
              .find("#rq_single_price > b")
              .html(current_total_single_system.toFixed(2));
          }
          if (document.getElementById("rq_acc_price")) {
            var acc_total_price = $("#rq_acc_price").data("accPrice");
            var single_total_price = Math.max(
              multi_total_price_system,
              current_total_single_system
            );
            var sum_total_price =
              parseFloat(acc_total_price) + parseFloat(single_total_price);
            activeContainer
              .find("#rq_total_price> b")
              .html(sum_total_price.toFixed(2));
          }
          activeContainer
            .find("#form-field-calc_single_summary")
            .text(multi_total_price_system.toFixed(0).toString());
          activeContainer
            .find("#form-field-calc_single_summary_brutto")
            .text(
              (multi_total_price_system * (1 + rq_VAT / 100))
                .toFixed(2)
                .toString()
            );
          activeContainer
            .find("#form-field-skorsten_single_calc_sum")
            .val(multi_total_price_system.toFixed(2).toString());
          activeContainer
            .find("#form-field-skorsten_single_calc_sum_brutto")
            .val(
              (multi_total_price_system * (1 + rq_VAT / 100))
                .toFixed(2)
                .toString()
            );
          $("#form-field-calc_total_summary").text(sumAllTotals());
          $("#form-field-calc_total_summary_brutto").text(sumAllTotals(rq_VAT));
          activeContainer
            .find("#form-field-skorsten_total_all_sum")
            .val(sumAllTotals());

          activeContainer
            .find("#form-field-skorsten_total_all_sum_brutto")
            .val(sumAllTotals(rq_VAT));
          var html_from_table_temp = activeContainer
            .find("#form-field-skorsten_calculation")
            .html();
          var html_from_table_temp_clear = $.parseHTML(html_from_table_temp);
          $(html_from_table_temp_clear)
            .find("*")
            .each(function () {
              if ($(this).css("display") == "none") {
                $(this).remove();
              }
            });
          var cleartable_html = `<table>${$(html_from_table_temp_clear)
            .eq($(html_from_table_temp_clear).length - 1)
            .html()}</table>`;
          activeContainer
            .find("input#form-field-skorsten_table_mail")
            .eq(1)
            .val(cleartable_html);
        });
      activeContainer
        .find(
          "#rq_elementy_zestawu_accordion, #rq_skorsten_accessories_accordion"
        )
        .on("click", function () {
          //FIX FOR NOT WORKING NESTED ACCORDIN
          $(this)
            .find(".bdt-accordion-icon-closed > i")
            .css("color", "#7A7A7A");

          if (
            $(this).find(".bdt-accordion-icon-closed").css("display") == "none"
          )
            $(this).find(".bdt-accordion-icon-closed").show(0);
          else $(this).find(".bdt-accordion-icon-closed").hide(0);

          if (
            $(this).find(".bdt-accordion-icon-opened").css("display") == "none"
          )
            $(this).find(".bdt-accordion-icon-opened").show(0);
          else $(this).find(".bdt-accordion-icon-opened").hide(0);
        });
    }
  });

$("#form-field-skorsten_price_change, #form-field-skorsten_rabat_change").on(
  "click keypress",
  function () {
    var current_total_single_system = parseFloat(
      $(this)
        .parents("div.elementor-row")
        .find("#rq_single_price")
        .data("singlePrice")
    );
    if (
      !isNaN(
        parseFloat(
          $(this)
            .parents("div.elementor-row")
            .find("#rq_acc_price")
            .data("acc-price")
        )
      )
    )
      current_total_single_system += parseFloat(
        $(this)
          .parents("div.elementor-row")
          .find("#rq_acc_price")
          .data("acc-price")
      );
    var discount = parseFloat(
      $(this)
        .parents("div.elementor-row")
        .find("#form-field-skorsten_rabat")
        .val()
    );
    var discount_multiplicator = 1 - discount / 100;
    current_total_single_system =
      current_total_single_system * discount_multiplicator;
    var multipliactor = parseFloat(
      $(this)
        .parents("div.elementor-row")
        .find("#form-field-skorsten_amount")
        .val()
    );
    var multi_total_price_system = current_total_single_system * multipliactor;
    var format =
      current_total_single_system.toFixed(2) +
      "[1]/" +
      multi_total_price_system.toFixed(2) +
      "[" +
      multipliactor +
      "]";

    if (multipliactor > 1) {
      $(this)
        .parents("div.elementor-row")
        .find("#rq_single_price > b")
        .html(format);
    } else {
      $(this)
        .parents("div.elementor-row")
        .find("#rq_single_price > b")
        .html(current_total_single_system.toFixed(2));
    }
    if (document.getElementById("rq_acc_price")) {
      var acc_total_price = $(this)
        .parents("div.elementor-row")
        .find("#rq_acc_price")
        .data("accPrice");
      var single_total_price = Math.max(
        multi_total_price_system,
        current_total_single_system
      );
      var sum_total_price =
        parseFloat(acc_total_price) + parseFloat(single_total_price);

      $(this)
        .parents("div.elementor-row")
        .find("#rq_total_price> b")
        .html(sum_total_price.toFixed(2));
    }
    $(this)
      .parents("div.elementor-row")
      .find("#form-field-calc_single_summary")
      .text(multi_total_price_system.toFixed(0).toString());
    $(this)
      .parents("div.elementor-row")
      .find("#form-field-calc_single_summary_brutto")
      .text(
        (multi_total_price_system * (1 + rq_VAT / 100)).toFixed(2).toString()
      );
    $(this)
      .parents("div.elementor-row")
      .find("#form-field-skorsten_single_calc_sum")
      .val(multi_total_price_system.toFixed(2).toString());
    $(this)
      .parents("div.elementor-row")
      .find("#form-field-skorsten_single_calc_sum_brutto")
      .val(
        (multi_total_price_system * (1 + rq_VAT / 100)).toFixed(2).toString()
      );
    $("#form-field-calc_total_summary").text(sumAllTotals());
    $("#form-field-skorsten_total_all_sum").val(sumAllTotals());
    $("#form-field-calc_total_summary_brutto").text(sumAllTotals(rq_VAT));
    $("#form-field-skorsten_total_all_sum_brutto").val(sumAllTotals(rq_VAT));
    var html_from_table_temp = $("#form-field-skorsten_calculation").html();
    var html_from_table_temp_clear = $.parseHTML(html_from_table_temp);
    $(html_from_table_temp_clear)
      .find("*")
      .each(function () {
        if ($(this).css("display") == "none") {
          $(this).remove();
        }
      });
    var cleartable_html = `<table>${$(html_from_table_temp_clear)
      .eq($(html_from_table_temp_clear).length - 1)
      .html()}</table>`;
    $("input#form-field-skorsten_table_mail").eq(1).val(cleartable_html);
  }
);

var roduq_returned_data_tmp;
var roduq_returned_data_string;
var roduq_returned_data;
var roduq_elements_table_tmp = "";
var total_palettes_tmp = 0;
var total_amount_tmp = 0;
function thth(insideElement) {
  return "<th>" + String(insideElement) + "</th>";
}
function tdtd(insideElement) {
  return "<td>" + String(insideElement) + "</td>";
}
//SKORSTEN KAZAŁ UKRYĆ
function tdptdp(insideElement) {
  return (
    "<td id='rq_single_price' style='display: none;' data-single-price='" +
    String(insideElement) +
    "' ><b>" +
    String(insideElement) +
    "</b></td>"
  );
}
function tdatda(insideElement) {
  return (
    "<td id='rq_acc_price' style='display: none;' data-acc-price='" +
    String(insideElement) +
    "' ><b>" +
    String(insideElement) +
    "</b></td>"
  );
}
function tdctdc(insideElement) {
  return (
    "<td id='rq_total_price' style='display: none;'><b>" +
    String(insideElement) +
    "</b></td>"
  );
}
function boldText(insideElement) {
  return "<b>" + String(insideElement) + "</b>";
}
function print_total_HTML_single_system(
  palettes_total_tmp,
  price_total_tmp,
  total_amount
) {
  return (
    '<tr style="display:none;">' +
    tdtd(boldText("Suma")) +
    //tdtd("") +
    //tdtd("") +
    //tdtd(boldText(palettes_total_tmp)) +
    tdptdp(price_total_tmp) +
    tdtd(total_amount) +
    "</tr>"
  );
}

function print_total_HTML_acc(
  palettes_total_tmp,
  price_total_tmp,
  total_amount
) {
  return (
    '<tr style="display:none;">' +
    tdtd(boldText("Suma")) +
    //tdtd("") +
    //tdtd("") +
    //tdtd(boldText(palettes_total_tmp)) +
    tdatda(price_total_tmp) +
    tdtd(total_amount) +
    "</tr>"
  );
}

function print_total_HTML(palettes_total_tmp, price_total_tmp, total_amount) {
  return (
    '<tr style="display:none;">' +
    tdtd(boldText("Suma całości")) +
    //tdtd("") +0
    //tdtd("") +
    //tdtd(boldText(palettes_total_tmp)) +
    tdctdc(price_total_tmp) +
    tdtd(total_amount) +
    "</tr>"
  );
}
var rq_systems_data_ask_server = function (
  system,
  diameter,
  height,
  pustak,
  accessories,
  splitter,
  packet,
  table_selector
) {
  console.log(`${system} ${pustak}`);
  var $this = $(this);

  $.ajax({
    type: "post",
    url:
      "https://skorstentransfer.essin.pl/skorsten-kalkulator/wp-admin/admin-ajax.php",
    data: {
      action: "rq_systems_data_ask_server",
      system: system,
      diameter: diameter,
      height: height,
      pustak: pustak,
      accessories: accessories,
      splitter: splitter,
      packet: packet,
    },
    complete: function (data) {
      roduq_total_system_price = 0;
      total_palettes_tmp = 0;
      total_amount_tmp = 0;
      roduq_elements_table_tmp = "";
      roduq_returned_data_tmp = data;
      roduq_returned_data_string = roduq_returned_data_tmp[
        "responseText"
      ].slice(0, -1);
      roduq_returned_data = jQuery.parseJSON(roduq_returned_data_string);
      roduq_elements_table_tmp = "<table><tbody>";
      roduq_elements_table_tmp +=
        "<b><tr>" +
        thth("Nazwa elementu") +
        //thth("Cena jednostkowa [zł]") +
        thth("Ilość") +
        //thth("Ilość palet [pal]") +
        //thth("Cena całkowita [zł]") +
        "</tr></b>";
      function createHTMLtableFromArray(element) {
        roduq_elements_table_tmp += "<tr>";
        roduq_elements_table_tmp += tdtd(element["name"]);
        //roduq_elements_table_tmp += tdtd(element["unit_price"]);
        roduq_elements_table_tmp += tdtd(element["amount"]);
        //roduq_elements_table_tmp += tdtd(element["palettes"]);
        /* roduq_elements_table_tmp += tdtd(
          element["total_element_price"].toFixed(2)
        ); */
        roduq_elements_table_tmp += "</tr>";
        total_palettes_tmp += element["palettes"];
        total_amount_tmp += parseInt(element["amount"]);
      }
      roduq_returned_data["elements"].forEach(createHTMLtableFromArray);
      roduq_elements_table_tmp += print_total_HTML_single_system(
        total_palettes_tmp,
        roduq_returned_data["total_price"],
        total_amount_tmp
      );
      if (!empty(roduq_returned_data["accessories"])) {
        roduq_elements_table_tmp += '<tr><td colspan="5"></td></tr>';
        roduq_elements_table_tmp +=
          "<b><tr>" +
          thth("Nazwa dodatku") +
          //thth("Cena jednostkowa [zł]") +
          thth("Ilość") +
          //thth("Ilość palet [pal]") +
          //thth("Cena całkowita [zł]") +
          "</tr></b>";
      }
      var accessoriesTotalPrice = 0;
      var total_palettes_accessories_tmp = 0;
      var total_amount_accessories_tmp = 0;
      function createHTMLtableFromArrayAccessories(element) {
        roduq_elements_table_tmp += "<tr>";
        roduq_elements_table_tmp += tdtd(element["name"]);
        //roduq_elements_table_tmp += tdtd(element["unit_price"]);
        roduq_elements_table_tmp += tdtd(element["amount"]);
        //roduq_elements_table_tmp += tdtd(element["palettes"]);
        //roduq_elements_table_tmp += tdtd(element["total_price"].toFixed(2));
        roduq_elements_table_tmp += "</tr>";
        accessoriesTotalPrice += element["total_price"].toFixed(2);
        total_palettes_tmp += element["palettes"];
        total_amount_tmp += parseInt(element["amount"]);
        //total_palettes_accessories_tmp += element["palettes"];
        total_amount_accessories_tmp += parseInt(element["amount"]);
      }
      if (!empty(roduq_returned_data["accessories"])) {
        roduq_returned_data["accessories"].forEach(
          createHTMLtableFromArrayAccessories
        );
        roduq_elements_table_tmp += print_total_HTML_acc(
          total_palettes_accessories_tmp,
          parseFloat(accessoriesTotalPrice).toFixed(2),
          total_amount_accessories_tmp
        );
        roduq_elements_table_tmp += '<tr><td colspan="5"></td></tr>';
        roduq_elements_table_tmp += print_total_HTML(
          total_palettes_tmp,
          (
            roduq_returned_data["total_price"] +
            parseFloat(accessoriesTotalPrice)
          ).toFixed(2),
          total_amount_tmp
        );
      }
      //GDZIEŚ TUTAJ WRZUCA TO W ODPOWIEDNIE POLE
      roduq_elements_table_tmp += "</tbody></table>";
      var roduq_elements_table = $.parseHTML(roduq_elements_table_tmp);
      $(table_selector).html(roduq_elements_table);
      $(table_selector)
        .parents("div.elementor-row")
        .find("#form-field-calc_single_summary")
        .text(
          (
            roduq_returned_data["total_price"] +
            parseFloat(accessoriesTotalPrice)
          )
            .toFixed(0)
            .toString()
        );
      $(table_selector)
        .parents("div.elementor-row")
        .find("#form-field-calc_single_summary_brutto")
        .text(
          (
            (roduq_returned_data["total_price"] +
              parseFloat(accessoriesTotalPrice)) *
            (1 + rq_VAT / 100)
          )
            .toFixed(2)
            .toString()
        );
      $(table_selector)
        .parents("div.elementor-row")
        .find("#form-field-skorsten_single_calc_sum")
        .val(
          (
            roduq_returned_data["total_price"] +
            parseFloat(accessoriesTotalPrice)
          )
            .toFixed(2)
            .toString()
        );
      $(table_selector)
        .parents("div.elementor-row")
        .find("#form-field-skorsten_single_calc_sum_brutto")
        .val(
          (
            (roduq_returned_data["total_price"] +
              parseFloat(accessoriesTotalPrice)) *
            (1 + rq_VAT / 100)
          )
            .toFixed(2)
            .toString()
        );
      $("#form-field-calc_total_summary").text(sumAllTotals());
      $("#form-field-calc_total_summary_brutto").text(sumAllTotals(rq_VAT));
      $("#form-field-skorsten_total_all_sum").val(sumAllTotals());
      $("#form-field-skorsten_total_all_sum_brutto").val(sumAllTotals(rq_VAT));
      $("#skorsten_obliczenia").show(400);
      $(table_selector)
        .parents("div.elementor-row")
        .find("#skorsten_wylicz")
        .show(500);
      $(table_selector)
        .parents("div.elementor-row")
        .find("#rq_button_loader")
        .hide(1000);
      var html_from_table = $(table_selector)
        .parents("div.elementor-row")
        .find("#form-field-skorsten_calculation")
        .html();
      var html_from_table_clear = $.parseHTML(html_from_table);
      $(html_from_table_clear)
        .find("*")
        .each(function () {
          if ($(this).css("display") == "none") {
            $(this).remove();
          }
        });
      var cleartable_html = `<table>${$(html_from_table_clear)
        .eq($(html_from_table_clear).length - 1)
        .html()}</table>`;
      $(table_selector)
        .parents("div.elementor-row")
        .find("input#form-field-skorsten_table_mail")
        .eq(1)
        .val(cleartable_html);
    },
  });
};
function write_single_elements_data() {
  $("#form-field-rq_single_category").empty();
  addArrayToSelectStandard_Element(
    single_elements_array["categories"],
    "form-field-rq_single_category",
    single_elements_array
  );
  $("#form-field-rq_single_category").on("change", function () {
    var selectedCategoryArray =
      single_elements_array[
        document.getElementById("form-field-rq_single_category").value
      ];
    $("#form-field-rq_single_element").empty();
    addArrayToSelectElements(
      getOnlyTitles(selectedCategoryArray),
      "form-field-rq_single_element"
    );
    setTimeout(() => {
      $("#form-field-calc_total_summary").text(sumAllTotals());
      $("#form-field-skorsten_total_all_sum").val(sumAllTotals());
      $("#form-field-calc_total_summary_brutto").text(sumAllTotals(rq_VAT));
      $("#form-field-skorsten_total_all_sum_brutto").val(sumAllTotals(rq_VAT));
      var single_element_price = $(".pafe-calculated-fields-form__value")
        .first()
        .text();
      var single_element_name = $(
        "#form-field-rq_single_element option:selected"
      ).text();
      $("#form-field-skorsten_single_add_price").val(single_element_price);
      $("#form-field-skorsten_single_add_name").val(single_element_name);
      var all_accessories_price = $(".pafe-calculated-fields-form__value")
        .last()
        .text();
      $("#form-field-skorsten_add_calc_sum").val(all_accessories_price);
      $("#form-field-skorsten_add_calc_sum_brutto").val(
        all_accessories_price * (1 + rq_VAT / 100)
      );
    }, 100);
  });
  $("#form-field-rq_single_element").on("change", function () {
    $("#form-field-calc_total_summary").text(sumAllTotals());
    $("#form-field-skorsten_total_all_sum").val(sumAllTotals());
    $("#form-field-calc_total_summary_brutto").text(sumAllTotals(rq_VAT));
    $("#form-field-skorsten_total_all_sum_brutto").val(sumAllTotals(rq_VAT));
    var single_element_price = $(".pafe-calculated-fields-form__value")
      .first()
      .text();
    var single_element_name = $(
      "#form-field-rq_single_element option:selected"
    ).text();
    $("#form-field-skorsten_single_add_price").val(single_element_price);
    $("#form-field-skorsten_single_add_name").val(single_element_name);
    var all_accessories_price = $(".pafe-calculated-fields-form__value")
      .last()
      .text();
    $("#form-field-skorsten_add_calc_sum").val(all_accessories_price);
    $("#form-field-skorsten_add_calc_sum_brutto").val(
      all_accessories_price * (1 + rq_VAT / 100)
    );
  });
  $(".nice-number").on("click", function () {
    $("#form-field-calc_total_summary").text(sumAllTotals());
    $("#form-field-skorsten_total_all_sum").val(sumAllTotals());
    $("#form-field-calc_total_summary_brutto").text(sumAllTotals(rq_VAT));
    $("#form-field-skorsten_total_all_sum_brutto").val(sumAllTotals(rq_VAT));
    var single_element_price = $(".pafe-calculated-fields-form__value")
      .first()
      .text();
    $("#form-field-skorsten_single_add_price").val(single_element_price);
    var all_accessories_price = $(".pafe-calculated-fields-form__value")
      .last()
      .text();
    $("#form-field-skorsten_add_calc_sum").val(all_accessories_price);
    $("#form-field-skorsten_add_calc_sum_brutto").val(
      all_accessories_price * (1 + rq_VAT / 100)
    );
  });
  $("#rq_add_next_element").on("click", function () {
    onClickElementsWatch();
    function onClickElementsWatch() {
      var previous_length = $(
        "section[data-pafe-form-builder-repeater-id='repeater_add_single']"
      ).length;
      setTimeout(() => {
        if (
          $("section[data-pafe-form-builder-repeater-id='repeater_add_single']")
            .length != previous_length
        )
          onClickNewElements();
        else onClickElementsWatch();
      }, 200);
      function onClickNewElements() {
        checkForNiceNumberEventListener_refresh();
        var activeContainerElements = $(
          "section[data-pafe-form-builder-repeater-id='repeater_add_single']"
        ).last();
        activeContainerElements.find("#form-field-rq_single_category").empty();
        activeContainerElements.find("#form-field-rq_single_element").empty();
        addArrayToSelectStandard_Element_JQuery(
          single_elements_array["categories"],
          activeContainerElements.find("#form-field-rq_single_category"),
          single_elements_array
        );
        activeContainerElements
          .find("#form-field-rq_single_category")
          .on("change", function () {
            var selectedCategoryArray =
              single_elements_array[
                activeContainerElements
                  .find("#form-field-rq_single_category")
                  .val()
              ];
            activeContainerElements
              .find("#form-field-rq_single_element")
              .empty();
            addArrayToSelectElements_JQuery(
              getOnlyTitles(selectedCategoryArray),
              activeContainerElements.find("#form-field-rq_single_element")
            );
            $("#form-field-calc_total_summary").text(sumAllTotals());
            activeContainerElements
              .find("#form-field-skorsten_total_all_sum")
              .val(sumAllTotals());
            $("#form-field-calc_total_summary_brutto").text(
              sumAllTotals(rq_VAT)
            );
            activeContainerElements
              .find("#form-field-skorsten_total_all_sum_brutto")
              .val(sumAllTotals(rq_VAT));
            var single_element_price = activeContainerElements
              .find(".pafe-calculated-fields-form__value")
              .text();
            var single_element_name = activeContainerElements
              .find("#form-field-rq_single_element option:selected")
              .text();
            activeContainerElements
              .find("#form-field-skorsten_single_add_price")
              .val(single_element_price);
            activeContainerElements
              .find("#form-field-skorsten_single_add_name")
              .val(single_element_name);
            var all_accessories_price = $(".pafe-calculated-fields-form__value")
              .last()
              .text();
            activeContainerElements
              .find("#form-field-skorsten_add_calc_sum")
              .val(all_accessories_price);
            activeContainerElements
              .find("#form-field-skorsten_add_calc_sum_brutto")
              .val(all_accessories_price * (1 + rq_VAT / 100));
          });
        activeContainerElements
          .find("#form-field-rq_single_element")
          .on("change", function () {
            $("#form-field-calc_total_summary").text(sumAllTotals());
            activeContainerElements
              .find("#form-field-skorsten_total_all_sum")
              .val(sumAllTotals());
            $("#form-field-calc_total_summary_brutto").text(
              sumAllTotals(rq_VAT)
            );
            activeContainerElements
              .find("#form-field-skorsten_total_all_sum_brutto")
              .val(sumAllTotals(rq_VAT));
            var single_element_price = activeContainerElements
              .find(".pafe-calculated-fields-form__value")
              .text();
            var single_element_name = activeContainerElements
              .find("#form-field-rq_single_element option:selected")
              .text();
            activeContainerElements
              .find("#form-field-skorsten_single_add_price")
              .val(single_element_price);
            activeContainerElements
              .find("#form-field-skorsten_single_add_name")
              .val(single_element_name);
            var all_accessories_price = $(".pafe-calculated-fields-form__value")
              .last()
              .text();
            activeContainerElements
              .find("#form-field-skorsten_add_calc_sum")
              .val(all_accessories_price);
            activeContainerElements
              .find("#form-field-skorsten_add_calc_sum_brutto")
              .val(all_accessories_price * (1 + rq_VAT / 100));
          });
        activeContainerElements.find(".nice-number").on("click", function () {
          $("#form-field-calc_total_summary").text(sumAllTotals());
          activeContainerElements
            .find("#form-field-skorsten_total_all_sum")
            .val(sumAllTotals());
          $("#form-field-calc_total_summary_brutto").text(sumAllTotals(rq_VAT));
          activeContainerElements
            .find("#form-field-skorsten_total_all_sum_brutto")
            .val(sumAllTotals(rq_VAT));
          var single_element_price = activeContainerElements
            .find(".pafe-calculated-fields-form__value")
            .text();
          activeContainerElements
            .find("#form-field-skorsten_single_add_price")
            .val(single_element_price);
          var all_accessories_price = $(".pafe-calculated-fields-form__value")
            .last()
            .text();
          activeContainerElements
            .find("#form-field-skorsten_add_calc_sum")
            .val(all_accessories_price);
          activeContainerElements
            .find("#form-field-skorsten_add_calc_sum_brutto")
            .val(all_accessories_price * (1 + rq_VAT / 100));
        });
        activeContainerElements
          .find("#form-field-rq_single_category")
          .trigger("change");
      }
    }
  });
  $("#form-field-rq_single_category").trigger("change");
}

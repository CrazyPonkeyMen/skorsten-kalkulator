// definition of skorsten system inner arrays

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
console.log("yes");
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
    $("#rq_loading_anim, .boxes").hide(500);
    rq_autofill_edit();
  } else
    setTimeout(() => {
      RQcheckIfLoadingComplete();
    }, 200);
}
//RQcheckIfLoadingComplete();
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
      console.log(data);
      data_string = data["responseText"].slice(0, -1);
      single_elements_array = jQuery.parseJSON(data_string);
      $(document).ready(function () {
        write_single_elements_data();
      });
    },
  });
};
rq_import_single_elements();

function defineVariables() {
  var object_rq = document.getElementById("form-field-skorsten_system");
  console.log("yes");
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
function addArrayToSelectElements(array, selectID) {
  var sel = document.getElementById(selectID);
  var fragment = document.createDocumentFragment();
  for (i = 0; i < array.length; i++) {
    var newOption = document.createElement("option");
    newOption.text = array[i][0];
    newOption.value = array[i][1];
    fragment.appendChild(newOption);
  }
  sel.appendChild(fragment);
}
function addArrayToSelectElements_JQuery(array, selector) {
  for (i = 0; i < array.length; i++) {
    selector.append(new Option(array[i][0], array[i][1]));
  }
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
  if (vat != false) allTotal = allTotal * (1 + vat / 100);
  return allTotal.toFixed(2);
}
function getOnlyTitles(array) {
  var temp_array = [];
  for (i = 0; i < array.length; i++) {
    temp_array.push([array[i]["title"], array[i]["price"]]);
  }
  return temp_array;
}
function update_product_text_field(product, amount, price, discount, selector) {
  //ADDED 22.05.2020
  var format = `${amount} x ${product} (${
    Math.abs(1 - discount)
  }% x ${amount} x ${price} = ${(Math.abs(1 - discount / 100) * amount * price).toFixed(
    2
  )}zł)`;
  selector.val(format);
}
// Jquery event listeners and toggle
function write_single_elements_data() {
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
    var rq_single_quantity = $("#form-field-add_single_quantity").val();
    var rq_single_product_discount = $("#form-field-add_single_rabat").val();
    var single_element_singular_price = $(
      "#form-field-rq_single_element"
    ).val();
    update_product_text_field(
      single_element_name,
      rq_single_quantity,
      single_element_singular_price,
      rq_single_product_discount,
      $("#form-field-rq_single_element_text")
    );
  });
  $(".nice-number").on("click", function () {
    $("#form-field-calc_total_summary").text(sumAllTotals());
    $("#form-field-skorsten_total_all_sum").val(sumAllTotals());
    $("#form-field-calc_total_summary_brutto").text(sumAllTotals(rq_VAT));
    $("#form-field-skorsten_total_all_sum_brutto").val(sumAllTotals(rq_VAT));
    var single_element_name = $(
      "#form-field-rq_single_element option:selected"
    ).text();
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
    var rq_single_quantity = $("#form-field-add_single_quantity").val();
    var rq_single_product_discount = $("#form-field-add_single_rabat").val();
    var single_element_singular_price = $(
      "#form-field-rq_single_element"
    ).val();
    update_product_text_field(
      single_element_name,
      rq_single_quantity,
      single_element_singular_price,
      rq_single_product_discount,
      $("#form-field-rq_single_element_text")
    );
    console.log("test");
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
            var rq_single_quantity = activeContainerElements
              .find("#form-field-add_single_quantity")
              .val();
            var rq_single_product_discount = activeContainerElements
              .find("#form-field-add_single_rabat")
              .val();
            var single_element_singular_price = activeContainerElements
              .find("#form-field-rq_single_element")
              .val();
            update_product_text_field(
              single_element_name,
              rq_single_quantity,
              single_element_singular_price,
              rq_single_product_discount,
              activeContainerElements.find("#form-field-rq_single_element_text")
            );
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
          var rq_single_quantity = activeContainerElements
            .find("#form-field-add_single_quantity")
            .val();
          var rq_single_product_discount = activeContainerElements
            .find("#form-field-add_single_rabat")
            .val();
          var single_element_singular_price = activeContainerElements
            .find("#form-field-rq_single_element")
            .val();
          var single_element_name = activeContainerElements
            .find("#form-field-rq_single_element option:selected")
            .text();
          update_product_text_field(
            single_element_name,
            rq_single_quantity,
            single_element_singular_price,
            rq_single_product_discount,
            activeContainerElements.find("#form-field-rq_single_element_text")
          );
        });
      }
    }
  });
}

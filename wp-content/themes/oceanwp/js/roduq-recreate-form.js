var import_complete = false;
var alert_changing_customer = false;
function GetURLParameter(sParam) {
  var sPageURL = window.location.search.substring(1);
  var sURLVariables = sPageURL.split("&");
  for (var i = 0; i < sURLVariables.length; i++) {
    var sParameterName = sURLVariables[i].split("=");
    if (sParameterName[0] == sParam) {
      return decodeURIComponent(sParameterName[1]);
    }
  }
}
function rq_getSavedSelections() {
  if (GetURLParameter("edit") != null) {
    $.ajax({
      type: "post",
      url:
        "https://skorstentransfer.essin.pl/skorsten-kalkulator/wp-admin/admin-ajax.php",
      data: {
        action: "rq_export_to_edit",
        calculation_id: GetURLParameter("edit"),
      },
      complete: function (data) {
        console.log(data);
        data_string = data["responseText"].slice(0, -1);
        choices_to_recreate = jQuery.parseJSON(data_string);
        rq_recreate_calculations(choices_to_recreate["choices"]);
        if (choices_to_recreate["additional_products"] != undefined)
          rq_recreate_single_products(
            choices_to_recreate["additional_products"]
          );
        function check_if_import_complete() {
          setTimeout(() => {
            if (import_complete) $("#rq_loading_anim, .boxes").hide(500);
            else check_if_import_complete();
          }, 200);
        }
        check_if_import_complete();
        function check_if_customer_field_exists() {
          setTimeout(() => {
            if ($("#form-field-selected_customer").length)
              import_customer(choices_to_recreate["customer"]);
            else check_if_customer_field_exists();
          }, 200);
        }
        check_if_customer_field_exists();
        function check_if_id_field_exists() {
          setTimeout(() => {
            if ($("#form-field-skorsten_id").length)
              import_id_field(choices_to_recreate["calculation_id"]);
            else check_if_id_field_exists();
          }, 200);
        }
        check_if_id_field_exists();

        function check_if_data_button_exists() {
          setTimeout(() => {
            if ($("#rq_calculation_data").length)
              $("#rq_calculation_data").on("click", function () {
                if (!alert_changing_customer) {
                  /* alert(
                    "Zmiana klienta spowoduje utworzenie nowej kalkulacji!"
                  ); */
                  alert_changing_customer = true;
                }
              });
            else check_if_data_button_exists();
          }, 200);
        }
        check_if_data_button_exists();

        //Warning after editing
        $("#skorsten_save_button").on("click", function () {
          alert("Edycja kalkulacji nie powoduje zmiany zawartości koszyka!");
        });
      },
    });
  }
}
/**
 * @param  {} id id of calculation to put in
 */

function import_id_field(id) {
  console.log("poprzednie" + $("#form-field-skorsten_id").val());
  console.log(typeof $("#form-field-skorsten_id").val());
  $("input#form-field-skorsten_id").val(id);
  $("input#form-field-skorsten_id").trigger("change");
  console.log("zaimportowano ID");
  console.log(id);
}
/**
 * @param  {} amount just an int
 * @param  {} discount discount in % (int)
 * @param  {} selector jquery selector of row to work on
 * @returns true if success, false in case of failure
 */
function import_amount_and_discount(amount, discount, selector) {
  console.log("rabaciki");
  console.log(amount);
  console.log(discount);
  selector.find("#form-field-skorsten_amount").val(amount);
  selector.find("#form-field-skorsten_amount").trigger("click");
  selector.find("#form-field-skorsten_rabat").val(discount);
  selector.find("#form-field-skorsten_rabat").trigger("click");
  return true;
}

/**
 * changes customer field to provided
 * @param  {} customer_id
 * @returns true if success, false in case of failure
 */
function import_customer(customer_id) {
  if (customer_id == null) return false;
  $("#form-field-selected_customer")
    .selectize()[0]
    .selectize.setValue(customer_id, false);
  return true;
}

//rq_getSavedSelections();
/**
 * Restores single calculation
 * @see function rq_recreate_calculation
 * @param  {} selection Object containing airbrick, diameter, height, packet, splitter, system (each with names from select)
 * @param  {} rowSelector Selector of group to input into
 * @param  {} fill Bool- true if should click "calclulate"
 */
function regenerate_selection(selection, rowSelector, fill) {
  if (typeof selection != "object") return false;
  if (typeof rowSelector != "object") return false;
  //Get "calculate" button
  var calculateButton = rowSelector.find("#skorsten_wylicz");

  //Getting inputs
  var systemField = rowSelector.find("#form-field-skorsten_system");
  var diameterField = rowSelector.find("#form-field-skorsten_srednica");
  var heigthField = rowSelector.find("#form-field-skorsten_wysokosc");
  var airbrickField = rowSelector.find("#form-field-skorsten_pustak");
  var splitterField = rowSelector.find("#form-field-skorsten_trojnik");
  var packetField = rowSelector.find("#form-field-skorsten_pakiet_montazowy");

  //Setting inputs
  systemField.val(selection["system"]);
  systemField.trigger("change");

  diameterField.val(selection["diameter"]);
  diameterField.trigger("change");

  heigthField.val(selection["height"]);
  heigthField.trigger("change");

  console.log(`introducing airbrick: ${selection["airbrick"]}`);
  airbrickField.val(selection["airbrick"]);
  airbrickField.trigger("change");

  var airbrickIndex = airbrickField.prop("selectedIndex");
  var imageAirbrick = rowSelector.find("#pustak_image_select");

  var index_for_ddslick_finder = 0;
  for (
    index_for_ddslick_finder = 0;
    index_for_ddslick_finder < airbrickField.find("option").length;
    index_for_ddslick_finder++
  ) {
    imageAirbrick.ddslick("select", { index: index_for_ddslick_finder });
    if (
      imageAirbrick.data("ddslick")["selectedData"]["value"] ==
      selection["airbrick"]
    )
      break;
  }
  console.log(
    `nie wykonuje fora bo dlugosc to:${airbrickField.find("option").length}`
  );
  //Not working because indexes are not the same in both fields
  //imageAirbrick.ddslick("select", { index: airbrickIndex });
  console.log(`wgrano pustak index: ${airbrickIndex}`);

  //Skip them if not set
  if (selection["splitter"] != "") {
    splitterField.val(selection["splitter"]);
    splitterField.trigger("change");
  }
  if (selection["packet"] != "") {
    packetField.val(selection["packet"]);
    packetField.trigger("change");
  }

  if (fill == true) calculateButton.click();
  console.log(`I've DONE MY JOB`);
  return true;
}
/**
 * Restoring user choices according to proviced array of choices
 * @param  {} choices_to_recreate Give it array returned by ajax
 * @return false while failure, true while success
 */
function rq_recreate_calculations(choices_to_recreate) {
  if (choices_to_recreate == null) return false;
  let i;
  for (i = 0; i < choices_to_recreate.length - 1; i++) {
    console.log("creating new calc");
    $("div[data-pafe-form-builder-repeater-trigger-action='add']")
      .eq(0)
      .click();
  }
  setTimeout(() => {
    rq_refill_calculations(choices_to_recreate);
  }, 2000);
  return true;
}
function rq_refill_calculations(choices_to_recreate) {
  if (choices_to_recreate == null) return false;
  let i;
  for (i = 0; i < choices_to_recreate.length; i++) {
    console.log("regenerating");
    regenerate_selection(
      choices_to_recreate[i],
      $("section#rq_toggle").eq(i),
      true
    );
    import_amount_and_discount(
      choices_to_recreate[i]["amount"],
      choices_to_recreate[i]["discount"],
      $("section#rq_toggle").eq(i)
    );
  }
  import_complete = true;
  return true;
}

function rq_recreate_single_products(products_list) {
  if(products_list.length) alert('Korygujemy błąd, kalkulacja z dodatkami przy edycji może zapisać dodatki z ceną 0. Po usunięciu usterki ponowna edycja naprawi kalkulację.');
  for (let index = 0; index < products_list.length; index++) {
    $("#rq_additional_products_switch").click();
  }
  setTimeout(() => {
    regenerate_single_product(products_list);
  }, 2000);
}

function regenerate_single_product(products_list) {
  for (let index = 0; index < products_list.length; index++) {
    var product_category = products_list[index]["cat"];
    var product_name = products_list[index]["title"];
    var product_amount = products_list[index]["amount"];
    var product_discount = products_list[index]["discount"];

    var single_products_sections = $(".single_element_section");
    //exit in case of failure
    if (single_products_sections.length != products_list.length) return false;

    var category_field = single_products_sections
      .eq(index)
      .find("#form-field-rq_single_category");
    var product_field = single_products_sections
      .eq(index)
      .find("#form-field-rq_single_element");
    var amount_field = single_products_sections
      .eq(index)
      .find("#form-field-add_single_quantity");
    var discount_field = single_products_sections
      .eq(index)
      .find("#form-field-add_single_rabat");

    category_field.val(product_category);
    category_field.trigger("change");

    var temp_option_value;
    product_field.find("option").each(function () {
      if ($(this).text() == product_name) {
        temp_option_value = $(this).attr("value");
        $(this).attr("value", "this_one");
      }
    });
    product_field.val("this_one");
    product_field
      .find('option[value="this_one"]')
      .attr("value", temp_option_value);
  }
  product_field.trigger("change");

  amount_field.val(product_amount);
  amount_field.trigger("change");

  discount_field.val(product_discount);
  discount_field.trigger("change");

  //correcting problem of price not updating
  $(document).trigger('change');
}

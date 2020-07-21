const rq_VAT = 23;
$('#rq_additional_products_print').find('table').find('thead').find('th').last().after('<th><label>CENA [BRUTTO]</label></th>');
for (let index = 0; index < $('#rq_additional_products_print').find('table').find('tbody').children().length; index++) {
    var netto_price = parseFloat($('#rq_additional_products_print').find('table').find('tbody').children().eq(index).find('td').last().find('div').text());
    var brutto_price = netto_price * (1 + (rq_VAT / 100));
    console.log(brutto_price);
    $('#rq_additional_products_print').find('table').find('tbody').children().eq(index).find('td').last().after(`<td><div class="repeater-item elementor-repeater-item-eb2071d">${brutto_price}</div></td>`);
}
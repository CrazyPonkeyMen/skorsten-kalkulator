<?php

/**
Plugin Name: Roduq Confidential Export Calculation to edit it
Author: Bartosz Pijet, Rafał Stefaniszyn
Version: 1.0 Beta
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
 */

//ADD AJAX RESPONSE TO EDIT CALCULATION
add_action('wp_ajax_nopriv_export_to_edit_nopriv', 'rq_export_to_edit_nopriv');
add_action('wp_ajax_rq_export_to_edit', 'rq_export_to_edit');

if (!function_exists("rq_export_to_edit_nopriv")) {
    /**
     * Returns to ajax for logged out users while asking for editing order
     * 
     * @since 1.0 Beta
     * 
     * @return null
     */
    function rq_export_to_edit_nopriv()
    {
        return;
    }
}

if (!function_exists("rq_export_to_edit")) {
    /**
     * Sending data about selected fields as json when asked by ajax
     *
     * @return json $pre_json_return
     */
    function rq_export_to_edit()
    {
        $allowded_html = array();
        $calculation_id = wp_kses($_POST['calculation_id'], $allowded_html);
        $calculation_post = get_post($calculation_id);
        $pre_json_return = array();

        //exit if calc is not created by user
        if (!current_user_can('administrator') && $calculation_post->post_author != wp_get_current_user()->ID)
            return;

        /**Getting field containing all calculations selections from post
         *  @see https://www.advancedcustomfields.com/
         */
        $calculations_choices_repeater = get_field("wybrane_opcje_export", $calculation_id);
        $calculations_repeater = get_field("wszystkie_kalkulacje", $calculation_id);
        //save customer data
        $customer_data = get_field("klient", $calculation_id);
        if (!empty($customer_data)) $pre_json_return['customer'] = $customer_data->ID;

        //save calculation ID (required to not create 2 posts with same ID's)
        $calculation_id_rq = get_field("id_kalkulacji", $calculation_id);
        if (!empty($calculation_id_rq)) $pre_json_return['calculation_id'] = $calculation_id_rq;

        //Getting all calculation selections to export
        $iterator_for_calculations = 0;
        foreach ($calculations_choices_repeater as $calculation) {
            $pre_json_return['choices'][] = array(
                'system' => $calculation['skorsten_system_priv'],
                'diameter' => $calculation['skorsten_srednica_priv'],
                'height' => $calculation['skorsten_wysokosc_priv'],
                'airbrick' => $calculation['skorsten_pustak_priv'],
                'splitter' => $calculation['skorsten_trojnik_priv'],
                'packet' => $calculation['skorsten_pakiet_montazowy_priv'],
                'discount' => $calculations_repeater[$iterator_for_calculations]['skorsten_rabat'],
                'amount' => $calculations_repeater[$iterator_for_calculations]['skorsten_amount']
            );
            $iterator_for_calculations++;
        }
        //
        //IMPORTING SINGLE PRODUCTS

        //Getting singe products repeater
        $calculations_choices_repeater = get_field("pojedynczy_element", $calculation_id);

        foreach ($calculations_choices_repeater as $single_item_from_repeater) {
            if(empty($single_item_from_repeater['skorsten_single_add_name'])) continue;
            $post_types_filter_elements = array(
                'numberposts' => 1,
                'post_type' => 'elementy_skladowe',
                'title' => $single_item_from_repeater['skorsten_single_add_name']
            );
            $found_element = get_posts($post_types_filter_elements);
            $element_id = $found_element[0]->ID;
            $pre_json_return['additional_products'][] = array(
                'title' => $single_item_from_repeater['skorsten_single_add_name'],
                'amount' => $single_item_from_repeater['add_single_quantity'],
                'discount' => $single_item_from_repeater['add_single_rabat'],
                'cat' => get_the_category($element_id)[0]->name
            );
        }

        //EOF IMPORTING SINGLE PRODUCTS
        //
        echo json_encode($pre_json_return);
        return;
    }
}

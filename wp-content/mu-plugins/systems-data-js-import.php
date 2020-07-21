<?php

/**
Plugin Name: Roduq Confidential Import PHP to JS
Author: Bartosz Pijet, Rafał Stefaniszyn
Version: 1.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html
 */

/* function it_is_not_ready_for_production()
{
	if (!current_user_can('administrator')) {
		wp_register_style('it_is_not_ready_for_production', 'https://skorstentransfer.essin.pl/skorsten-kalkulator/wp-content/themes/oceanwp/assets/css/it_is_not_ready_for_production.css', __FILE__);
		wp_enqueue_style('it_is_not_ready_for_production');
	}
}
*/

function it_is_not_ready_for_production_v2()
{
	if (!current_user_can('administrator')) {
		wp_register_style('it_is_not_ready_for_production_v2', 'https://skorstentransfer.essin.pl/skorsten-kalkulator/wp-content/themes/oceanwp/assets/css/it_is_not_ready_for_production_v2.css', __FILE__);
		wp_enqueue_style('it_is_not_ready_for_production_v2');
	}
}

function roduq_additional_elements_brutto()
{
	if(get_post()->post_type == 'skorsten_kalkulator')
	{
		wp_enqueue_script('roduq_additional_elements_brutto', 'https://skorstentransfer.essin.pl/skorsten-kalkulator/wp-content/themes/oceanwp/js/roduq_additional_elements_brutto.js', array('jquery'), null, true);
	}
}
add_action('wp_enqueue_scripts', 'roduq_additional_elements_brutto');

function sorry_under_maintenence_rq()
{
	if(is_page(2145) || is_page(1637))
	{
		wp_enqueue_script('sorry_under_maintenence_rq', 'https://skorstentransfer.essin.pl/skorsten-kalkulator/wp-content/themes/oceanwp/js/sorry_under_maintenence_rq.js', array('jquery'), null, true);
	}
}
add_action('wp_enqueue_scripts', 'sorry_under_maintenence_rq');

add_action('wp_enqueue_scripts', 'it_is_not_ready_for_production_v2');
//SHORTCODES
function trade_terms_shortcode()
{
	$output_html = "";
	if (is_user_logged_in()) {
		$output_html .= '<div id="rq-trade-terms">';
		$found_trade_terms = get_posts(array(
			'numberposts'	=> 1,
			'post_type'		=> 'trade_terms',
			'meta_key'		=> 'dystrybutor',
			'meta_value'	=> wp_get_current_user()->ID
		));
		$trade_term = $found_trade_terms[0];
		$output_html .= '<h2>';
		$output_html .= $trade_term->post_title;
		$output_html .= '</h2>';
		$output_html .= $trade_term->post_content;
		$output_html .= '<p style="text-align: right">Ostatnio zmodyfikowano: ';
		$output_html .= $trade_term->post_modified;
		$output_html .= '</p>';
		$output_html .= "</div>";
	} else {
		$output_html .= '<p style="text-align: center;"><h1>Musisz być zalogowany</h1></p>';
	}
	return $output_html;
}
add_shortcode('TRADE_TERMS', 'trade_terms_shortcode');

function shortcode_my_orders()
{
	//$current_page = get_post()->ID;
	$current_page = "";
	$current_page    = empty($current_page) ? 1 : absint($current_page);
	$customer_orders = wc_get_orders(
		apply_filters(
			'woocommerce_my_account_my_orders_query',
			array(
				'customer' => get_current_user_id(),
				'page'     => $current_page,
				'paginate' => true,
			)
		)
	);

	wc_get_template(
		'myaccount/orders.php',
		array(
			'current_page'    => absint($current_page),
			'customer_orders' => $customer_orders,
			'has_orders'      => 0 < $customer_orders->total,
		)
	);
}
add_shortcode('my_orders', 'shortcode_my_orders');

function customers_list_shortcode()
{
	$output_html = "";
	if (is_user_logged_in()) {
		$output_html .= "<ul>";
		$post_types_filter_customers = array(
			'numberposts'	=> -1,
			'post_type' 	=> 'klienci',
			'order'			=> 'ASC',
			'orderby'		=> 'title',
			'author'		=> wp_get_current_user()->ID
		);
		$posts = get_posts($post_types_filter_customers);
		if (!empty($posts)) {
			foreach ($posts as &$post) {
				$output_html .= '<li><a href="';
				$output_html .= get_permalink($post);
				$output_html .= '">';
				$output_html .= strval($post->ID) . " " . strval($post->post_title);
				$output_html .= '</a></li>';
			}
		}
		$output_html .= "</ul>";
	} else {
		$output_html .= '<p style="text-align: center;"><h1>Musisz być zalogowany</h1></p>';
	}
	return $output_html;
}
add_shortcode('CUSTOMERS_LIST', 'customers_list_shortcode');

function calculations_list_shortcode()
{
	$output_html = "";
	if (is_user_logged_in()) {
		$output_html .= "<ul>";
		$post_types_filter_customers = array(
			'numberposts'	=> -1,
			'post_type' 	=> 'skorsten_kalkulator',
			'order'			=> 'ASC',
			'orderby'		=> 'title',
			'author'		=> wp_get_current_user()->ID
		);
		$posts = get_posts($post_types_filter_customers);
		if (!empty($posts)) {
			foreach ($posts as &$post) {
				$output_html .= '<li><a href="';
				$output_html .= get_permalink($post);
				$output_html .= '">';
				$output_html .= strval($post->ID) . " " . strval($post->post_title);
				$output_html .= '</a></li>';
			}
		}
		$output_html .= "</ul>";
	} else {
		$output_html .= '<p style="text-align: center;"><h1>Musisz być zalogowany</h1></p>';
	}
	return $output_html;
}
add_shortcode('CALCULATION_LIST', 'calculations_list_shortcode');
//END OF SHORTCODES

add_action('wp_ajax_nopriv_rq_import_customer_single_data', 'rq_import_customer_single_data_nopriv');
add_action('wp_ajax_rq_import_customer_single_data', 'rq_import_customer_single_data');
if (!function_exists('rq_import_customer_single_data')) {
	function rq_import_customer_single_data()
	{
		$allowded_html = array();
		$calculation_id = wp_kses($_POST['calculation_id'], $allowded_html);
		$customer_id = get_field('klient', $calculation_id)->ID;
		$customer_data = get_field('dane', $customer_id);
		$customer_name = get_post($customer_id)->post_title;
		echo json_encode(array(
			'customer_name' => $customer_name,
			'customer_data' => $customer_data
		));
	}
}

add_action('acf/save_post', 'rq_new_user_form_after_save', 20);
function rq_new_user_form_after_save($post_id)
{
	if (!(is_user_logged_in() || current_user_can('publish_posts'))) {
		return;
	}
	if (get_post_type($post_id) == 'klienci')
		add_post_meta($post_id, '_wp_page_template', 'templates/edit_customer.php');
}
function roduq_enqueue_script_importer()
{
	if (is_page(89)) {
		wp_enqueue_script('rq_import_systems_data', 'https://skorstentransfer.essin.pl/skorsten-kalkulator/wp-content/themes/oceanwp/js/roduq-skorsten-calc.js', array('jquery'), null, true);
		wp_enqueue_script('rq_recreate_form', 'https://skorstentransfer.essin.pl/skorsten-kalkulator/wp-content/themes/oceanwp/js/roduq-recreate-form.js', array('jquery'), null, true);
	} else
		return;
}
add_action('wp_enqueue_scripts', 'roduq_enqueue_script_importer');

function roduq_enqueue_script_importer_single_item()
{
	if (is_page(1626)) {
		wp_enqueue_script('rq_import_systems_data', 'https://skorstentransfer.essin.pl/skorsten-kalkulator/wp-content/themes/oceanwp/js/roduq-skorsten-calc-single-items.js', array('jquery'), null, true);
	} else
		return;
}
add_action('wp_enqueue_scripts', 'roduq_enqueue_script_importer_single_item');

add_action('wp_ajax_nopriv_rq_import_user_customers', 'rq_import_user_customers_nopriv');
add_action('wp_ajax_rq_import_user_customers', 'rq_import_user_customers');
if (!function_exists('rq_import_user_customers')) {
	function rq_import_user_customers()
	{
		$active_user = wp_get_current_user();
		$active_user_id = $active_user->ID;
		$post_types_filter_customers = array(
			'numberposts'	=> -1,
			'post_type' 	=> 'klienci',
			'order'			=> 'ASC',
			'orderby'		=> 'title',
			'author'		=> $active_user_id
		);
		$found_customers = get_posts($post_types_filter_customers);
		if (count($found_customers) != 0)
			echo json_encode($found_customers);
		else
			echo json_encode("Dodaj klientów");
	}
}
if (!function_exists('rq_import_user_customers_nopriv')) {
	function rq_import_user_customers_nopriv()
	{
		if (is_user_logged_in()) {
			//FIX IT! THERE SHOULD BE "return;"
			$active_user = wp_get_current_user();
			$active_user_id = $active_user->ID;
			$post_types_filter_customers = array(
				'numberposts'	=> -1,
				'post_type' 	=> 'klienci',
				'order'			=> 'ASC',
				'orderby'		=> 'title',
				'author'		=> $active_user_id
			);
			$found_customers = get_posts($post_types_filter_customers);
			if (count($found_customers) != 0)
				echo json_encode($found_customers);
			else
				echo json_encode("Dodaj klientów");
		} else return;
	}
}
add_action('wp_ajax_nopriv_ask_for_customer_note', 'ask_for_customer_note_nopriv');
add_action('wp_ajax_ask_for_customer_note', 'ask_for_customer_note');
if (!function_exists('ask_for_customer_note')) {
	function ask_for_customer_note()
	{
		$allowded_html = array();
		$customer_id = wp_kses($_POST['customer_id'], $allowded_html);
		if (!current_user_can('administrator') && get_post($customer_id)->post_author != wp_get_current_user())
			return;
		$respond = get_field('uwagi', $customer_id);
		if (!empty($respond)) echo json_encode($respond);
		else return false;
	}
}
if (!function_exists('ask_for_customer_note_nopriv')) {
	function ask_for_customer_note_nopriv()
	{
		return false;
	}
}
add_action('wp_ajax_nopriv_rq_import_airbrick_types', 'rq_import_airbrick_types');
add_action('wp_ajax_rq_import_airbrick_types', 'rq_import_airbrick_types');
if (!function_exists('rq_import_airbrick_types')) {
	function rq_import_airbrick_types()
	{
		$output = array();
		$post_types_filter = array(
			'numberposts' => -1,
			'post_type' => 'elementy_skladowe',
			'order'		=> 'ASC',
			'orderby'	=> 'title',
			'category_name' => 'pustaki-kominowe'
		);
		$found_airbricks = get_posts($post_types_filter);
		foreach ($found_airbricks as &$airbrick) {
			$output[] = array(
				'title' => $airbrick->post_title,
				'thumbnail' => get_the_post_thumbnail_url($airbrick, array(32, 23))
			);
		}
		echo json_encode($output);
		return;
	}
}
add_action('wp_ajax_nopriv_rq_import_systems_data', 'rq_import_systems_data');
add_action('wp_ajax_rq_import_systems_data', 'rq_import_systems_data');
if (!function_exists('rq_import_systems_data')) {
	function rq_import_systems_data()
	{
		/*
		* CRITICAL
		* 
		* IMPORT TABLICY SYSTEMÓW DO JAVASCRIPTU
		*/
		$debug_data = array();
		$post_types_filter_system = array(
			'numberposts' => -1,
			'post_type' => 'system',
			'order'		=> 'ASC',
			'orderby'	=> 'title'
		);
		$found_systems = get_posts($post_types_filter_system);
		$systems_data = array();
		$found_systems_counter = 0;
		foreach ($found_systems as &$object) {
			$active_object_ID = $object->ID;
			$system_title = get_field('nazwa_systemu', $active_object_ID);
			$system_diameter = get_field('srednica', $active_object_ID);
			$systems_data[] = array('title' => $system_title, 'diameter' => $system_diameter, 'heights' => array());
			$heights_array = get_field('typy_wysokosci', $active_object_ID);
			if (!empty($heights_array)) {
				for ($i = 0; $i < sizeof($heights_array); $i++) {
					$height = $heights_array[$i]['wysokosc'];
					$systems_data[$found_systems_counter]['heights'][$i]['height'] = $height;
					$airbrick_array = $heights_array[$i]['typy_pustaka'];
					if (!empty($airbrick_array)) {
						for ($j = 0; $j < sizeof($airbrick_array); $j++) {
							$airbrick_ID = $airbrick_array[$j]['typ_pustaka']->ID;
							$systems_data[$found_systems_counter]['heights'][$i]['airbricks'][$j]['airbrick'] = $airbrick_ID;
							$elements_array = $airbrick_array[$j]['elementy_skladowe'];
							if (!empty($elements_array)) {
								for ($k = 0; $k < sizeof($elements_array); $k++) {
									$element_object = $elements_array[$k]['element_skladowy'];
									$amount = $elements_array[$k]['ilosc_elementow'];
									$systems_data[$found_systems_counter]['heights'][$i]['airbricks'][$j]['elements'][$k]['ID'] = $element_object->ID;
									$systems_data[$found_systems_counter]['heights'][$i]['airbricks'][$j]['elements'][$k]['amount'] = $amount;
								}
							}
						}
					}
				}
			}
			$found_systems_counter++;
		}
		$systems_data_minimized = array();
		foreach ($systems_data as &$single_system) {
			foreach ($single_system['heights'] as &$single_height) {
				foreach ($single_height['airbricks'] as &$single_airbrick) {
					$systems_data_minimized[$single_system['title']][$single_system['diameter']][$single_height['height']][get_post($single_airbrick['airbrick'])->post_title] = $single_airbrick['elements'];
					if (!in_array($single_system['title'], $systems_data_minimized['titles'])) {
						$systems_data_minimized['titles'][] = $single_system['title'];
					}
					if (!in_array($single_system['diameter'], $systems_data_minimized[$single_system['title']]['diameters'])) {
						$systems_data_minimized[$single_system['title']]['diameters'][] = $single_system['diameter'];
					}
					if (!in_array($single_height['height'], $systems_data_minimized[$single_system['title']][$single_system['diameter']]['heights'])) {
						$systems_data_minimized[$single_system['title']][$single_system['diameter']]['heights'][] = $single_height['height'];
					}
					if (!in_array($single_airbrick['airbrick'], $systems_data_minimized[$single_system['title']][$single_system['diameter']][$single_height['height']]['airbricks'])) {
						$systems_data_minimized[$single_system['title']][$single_system['diameter']][$single_height['height']]['airbricks'][] = get_post($single_airbrick['airbrick'])->post_title;
					}
				}
			}
		}
		$post_types_filter_system = array(
			'numberposts' => -1,
			'post_type' => 'wentylacje',
			'order'		=> 'ASC',
			'orderby'	=> 'title'
		);
		$found_systems = get_posts($post_types_filter_system);
		foreach ($found_systems as &$object) {
			$system_id = $object->ID;
			$system_name = get_field('nazwa_systemu', $system_id);
			$system_airbrick_object = get_field('typ_pustaka', $system_id);
			$system_airbrick_title = $system_airbrick_object->post_title;
			$system_height_array = get_field('wysokosci', $system_id);
			if (!in_array($system_name, $systems_data_minimized['titles']))
				$systems_data_minimized['titles'][] = $system_name;
			foreach ($system_height_array as &$height_array) {
				$height = $height_array['wysokosc'];
				$elementy_skladowe_array = $height_array['elementy_skladowe'];
				if (!in_array($height, $systems_data_minimized[$system_name]['heights']))
					$systems_data_minimized[$system_name]['heights'][] = $height;
				if (!in_array($system_airbrick_title, $systems_data_minimized[$system_name][$height]['airbricks']))
					$systems_data_minimized[$system_name][$height]['airbricks'][] = $system_airbrick_title;
				foreach ($elementy_skladowe_array as &$element_skladowy) {
					$amount = $element_skladowy['ilosc'];
					$element_object = $element_skladowy['element_skladowy'];
					$element_id = $element_object->ID;
					$systems_data_minimized[$system_name][$height][$system_airbrick_title][] = array(
						'ID' => $element_id,
						'amount' => $amount
					);
				}
			}
		}
		echo json_encode($systems_data_minimized);
	}
}
add_action('wp_ajax_nopriv_rq_import_accessories_data', 'rq_import_accessories_data');
add_action('wp_ajax_rq_import_accessories_data', 'rq_import_accessories_data');
if (!function_exists('rq_import_accessories_data')) {
	function rq_import_accessories_data()
	{
		/*
		* CRITICAL
		* 
		* IMPORT TABLICY SYSTEMÓW DO JAVASCRIPTU
		*/
		$post_types_filter_system = array(
			'numberposts' => -1,
			'post_type' => 'system',
			'order'		=> 'ASC',
			'orderby'	=> 'title'
		);
		$found_systems = get_posts($post_types_filter_system);
		$accessories_data = array();
		$found_systems_counter = 0;
		foreach ($found_systems as &$object) {
			$active_object_ID = $object->ID;
			$accessories_data[] = array('system' => get_field('nazwa_systemu', $active_object_ID), 'diameter' => get_field('srednica', $active_object_ID), 'airbrick_types' => array());
			$airbricks_array = get_field('typy_pustaka', $active_object_ID);
			if (!empty($airbricks_array)) {
				for ($i = 0; $i < sizeof($airbricks_array); $i++) {
					$airbrick = $airbricks_array[$i]['typ_pustaka']->post_title;
					$accessories_data[$found_systems_counter]['airbrick_types'][$i]['airbrick'] = $airbrick;
					$elements_array = $airbricks_array[$i]['akcesoria'];
					if (!empty($elements_array)) {
						for ($j = 0; $j < sizeof($elements_array); $j++) {
							$element_object = $elements_array[$j]['akcesorium'];
							$element_amount = $elements_array[$j]['ilosc'];
							$element_ID = $element_object->ID;
							$unit_price = get_field('cena', $element_ID);
							$accessories_data[$found_systems_counter]['airbrick_types'][$i]['elements'][] = array('title' => $element_object->post_title, 'amount' => $element_amount, 'unit_price' => $unit_price, 'total_price' => $unit_price * $element_amount, 'ID' => $element_ID);
						}
					}
				}
			}
			$found_systems_counter++;
		}
		//ADDON DO PAKIETÓW MONTAŻOWYCH

		$post_types_filter_packets = array(
			'numberposts' => -1,
			'post_type' => 'pakiety_montazowe',
			'order'		=> 'ASC',
			'meta_key'	=> 'dodatkowa_cena',
			'orderby'	=> 'meta_value_num'
		);
		$found_packets = get_posts($post_types_filter_packets);
		$packets_data = array();
		$found_packets_counter = 0;
		foreach ($found_packets as &$packet) {
			$active_packet_id = $packet->ID;
			$active_packet_title = $packet->post_title;
			$price = get_field('dodatkowa_cena', $active_packet_id);
			$description = get_field('opis', $active_packet_id);
			$connected_systems = array();
			$connected_systems_temp = get_field('powiazane_systemy', $active_packet_id);
			foreach ($connected_systems_temp as &$connected_system) {
				$system_ID_temp = $connected_system['system']->ID;
				$system_name = get_field('nazwa_systemu', $system_ID_temp);
				$connected_systems[] = $system_name;
			}
			$packets_data[] = array(
				'title' => $active_packet_title,
				'price' => $price,
				'packet_id' => $active_packet_id,
				'description' => $description,
				'connected_systems' => $connected_systems
			);
		}
		//END OF ADDON

		//ADDON DO WYBORU TROJNIKA

		$post_types_filter_splitters = array(
			'numberposts' => -1,
			'post_type' => 'rodzaje_trojnika',
			'order'		=> 'ASC',
			'meta_key'	=> 'dodatkowa_cena',
			'orderby'	=> 'meta_value_num'
		);
		$found_splitters = get_posts($post_types_filter_splitters);
		$splitters_data = array();
		$found_splitters_counter = 0;
		foreach ($found_splitters as &$splitter) {
			$active_splitter_id = $splitter->ID;
			$active_splitter_title = $splitter->post_title;
			$price = get_field('dodatkowa_cena', $active_splitter_id);
			$connected_systems = array();
			$connected_systems_temp = get_field('powiazane_systemy', $active_splitter_id);
			foreach ($connected_systems_temp as &$connected_system) {
				$system_ID_temp = $connected_system['system']->ID;
				$system_name = get_field('nazwa_systemu', $system_ID_temp);
				$system_diameter_splitter = get_field('srednica', $system_ID_temp);
				$connected_systems[] = array('name' => $system_name, 'diameter' => $system_diameter_splitter, 'system_id' => $system_ID_temp);
			}
			$splitters_data[] = array(
				'title' => $active_splitter_title,
				'price' => $price,
				'connected_systems' => $connected_systems,
				'splitter_id' => $active_splitter_id
			);
		}

		//END OF ADDON

		$accessories_data_minimized = array();
		foreach ($accessories_data as &$accesory) {
			foreach ($accesory['airbrick_types'] as &$airbrick) {
				foreach ($airbrick['elements'] as &$element) {
					$accessories_data_minimized[$accesory['system']][$accesory['diameter']][$airbrick['airbrick']]['elements'][] = $element;
				}
			}
		}

		//ADDON PAKIETÓW MONTAŻOWYCH MINIMIZER
		foreach ($packets_data as &$packet) {
			foreach ($packet['connected_systems'] as &$system) {
				$accessories_data_minimized[$system]['packets'][$packet['title']] = array(
					'title' => $packet['title'],
					'price' => $packet['price'],
					'description' => $packet['description'],
					'id' => $packet['packet_id']
				);
				if (empty($accessories_data_minimized[$system]['packets']['list'])) $accessories_data_minimized[$system]['packets']['list'] = array();
				if (!in_array($packet['title'], $accessories_data_minimized[$system]['packets']['list']))
					$accessories_data_minimized[$system]['packets']['list'][] = $packet['title'];
			}
		}

		//END OF ADDON MINIMIZER

		//ADDON WYBORU TROJNIKA MINIMIZER

		foreach ($splitters_data as &$splitter) {
			foreach ($splitter['connected_systems'] as &$system) {
				$accessories_data_minimized[$system['name']][$system['diameter']]['splitters'][$splitter['title']] = array(
					'title' => $splitter['title'],
					'price' => $splitter['price'],
					'id' => $splitter['splitter_id']
				);
				$accessories_data_minimized[$system['name']][$system['diameter']]['splitters']['list'][] = $splitter['title'];
			}
		}

		//END OF ADDON MINIMIZER

		echo json_encode($accessories_data_minimized);
	}
}
function getElementPrice($elementID, $elementAmount)
{
	return (get_field('cena', $elementID) * $elementAmount);
}
add_action('wp_ajax_nopriv_rq_systems_data_ask_server', 'rq_systems_data_ask_server');
add_action('wp_ajax_rq_systems_data_ask_server', 'rq_systems_data_ask_server');
if (!function_exists('rq_systems_data_ask_server')) {
	function rq_systems_data_ask_server()
	{
		$allowded_html = array();
		$system = wp_kses($_POST['system'], $allowded_html);
		$diameter = wp_kses($_POST['diameter'], $allowded_html);
		$height = wp_kses($_POST['height'], $allowded_html);
		$pustak = wp_kses($_POST['pustak'], $allowded_html);
		$packet_id = "";
		$packet_id = "";
		if (!empty($_POST['accessories']))
			$accessories = $_POST['accessories'];
		if (isset($_POST['splitter']))
			$splitter_id = wp_kses($_POST['splitter'], $allowded_html);
		if (isset($_POST['packet']))
			$packet_id = wp_kses($_POST['packet'], $allowded_html);
		$system_id = 0;
		$system_and_diameter = $system . " " . $diameter;
		$accessories_output = array();
		$found_splitter = null;
		$found_packet = null;

		//FIND SHORTCUT
		$pustak_shurtcut = "";
		$arrayed_pustak = str_split($pustak);
		for ($l = (count($arrayed_pustak) - 1); $l >= 0; $l--) {
			if ($arrayed_pustak[$l] != " ")
				$pustak_shurtcut .= $arrayed_pustak[$l];
			else
				break;
		}
		$pustak_shurtcut = strrev($pustak_shurtcut);
		$system_and_pustak = $system . " " . $pustak_shurtcut;
		//Kod systemów wentylacji
		if ($system == "SKORSTEN WENTYLACJA") {
			if (!empty($splitter_id)) {
				$found_splitter = get_post($splitter_id);
			}

			if (!empty($packet_id)) {
				$found_packet = get_post($packet_id);
			}
			if (!empty($accessories)) {
				foreach ($accessories as &$accessory) {
					$post_types_filter_accessory = array(
						'title' 	=> $accessory[0],
						'post_type' => 'elementy_skladowe',
						'order'		=> 'ASC',
						'orderby'	=> 'title'
					);

					//Most important variable
					$active_accessory_object = get_posts($post_types_filter_accessory)[0];
					$accessories_output[] = array(
						'name' => $active_accessory_object->post_title,
						'unit_price' => get_field('cena', $active_accessory_object->ID),
						'total_price' => round(((get_field('cena', $active_accessory_object->ID)) * $accessory[1]), 2),
						'amount' => $accessory[1],
						'palettes' => ceil(floatval($accessory[1] / get_field('pal', $active_accessory_object->ID)))
					);
				}
			}

			$post_types_filter_system = array(
				'title' 	=> $system_and_pustak,
				'post_type' => 'wentylacje',
				'order'		=> 'ASC',
				'orderby'	=> 'title'
			);

			//Most important variable
			$active_system_object = get_posts($post_types_filter_system)[0];

			$system_id = intval($active_system_object->ID);
			$fieldset = get_field('wysokosci', $system_id);
			$height_index = 0;
			$height_size = sizeof($fieldset);

			for ($active_checking_height_index = 0; $active_checking_height_index < $height_size; ++$active_checking_height_index) {
				$active_height = strval($fieldset[$active_checking_height_index]['wysokosc']);
				if ($active_height == $height) {
					$height_index = $active_checking_height_index;
					break;
				}
			}
			$active_elements_array = $fieldset[$height_index]['elementy_skladowe'];
			$system_thumbnail_url = get_the_post_thumbnail_url($active_system_object);
			$elements_data = array();

			if (!empty($active_elements_array)) {
				foreach ($active_elements_array as &$single_element_array) {
					$element_thumbnail_url = get_the_post_thumbnail_url(has_post_thumbnail($single_element_array['element_skladowy']));
					$amount_for_palette = get_field('pal', $single_element_array['element_skladowy']->ID);
					$weight = get_field('waga', $single_element_array['element_skladowy']->ID);
					if ($single_element_array['ilosc'] != 0) {
						$elements_data[] = array(
							'ID' => $single_element_array['element_skladowy']->ID,
							'name' => $single_element_array['element_skladowy']->post_title,
							'unit_price' => getElementPrice($single_element_array['element_skladowy']->ID, 1),
							'amount' => $single_element_array['ilosc'],
							'amount_for_palette' => $amount_for_palette,
							'weight' => $weight,
							'palettes' => ceil(floatval($amount_for_palette / $single_element_array['ilosc'])),
							'palettes_float' => floatval($amount_for_palette / $single_element_array['ilosc']),
							'total_element_price' => round(getElementPrice($single_element_array['element_skladowy']->ID, 1) * $single_element_array['ilosc'], 2),
							'thumbnail_url' => $element_thumbnail_url
						);
						if (!empty($splitter_id) && stripos($single_element_array['element_skladowy']->post_title, 'Trójnik przyłączeniowy') !== false) {
							$proper_active_index = count($elements_data) - 1;
							$elements_data[$proper_active_index]['name'] = $found_splitter->post_title;
							$elements_data[$proper_active_index]['unit_price'] = $elements_data[$proper_active_index]['unit_price'] + get_field('dodatkowa_cena', $found_splitter->ID);
							$elements_data[$proper_active_index]['total_element_price'] = round($elements_data[$proper_active_index]['unit_price'] * $elements_data[$proper_active_index]['amount'], 2);
						}

						if (!empty($packet_id) && stripos($single_element_array['element_skladowy']->post_title, 'pakiet') !== false) {
							$proper_active_index = count($elements_data) - 1;
							$elements_data[$proper_active_index]['name'] = $found_packet->post_title;
							$elements_data[$proper_active_index]['unit_price'] = $elements_data[$proper_active_index]['unit_price'] + get_field('dodatkowa_cena', $found_packet->ID);
							$elements_data[$proper_active_index]['total_element_price'] = round($elements_data[$proper_active_index]['unit_price'] * $elements_data[$proper_active_index]['amount'], 2);
						}
					} else {
						$elements_data[] = array(
							'ID' => $single_element_array['element_skladowy']->ID,
							'name' => $single_element_array['element_skladowy']->post_title,
							'unit_price' => getElementPrice($single_element_array['element_skladowy']->ID, 1),
							'amount' => $single_element_array['ilosc'],
							'amount_for_palette' => $amount_for_palette,
							'weight' => $weight,
							'palettes' => 0,
							'palettes_float' => 0,
							'total_element_price' => round(getElementPrice($single_element_array['element_skladowy']->ID, 1) * $single_element_array['ilosc'], 2),
							'thumbnail_url' => $element_thumbnail_url
						);
					}
				}
			}
			$total_price = 0;
			if (!empty($elements_data)) {
				foreach ($elements_data as &$single_element_array) {
					$total_price += $single_element_array['unit_price'] * $single_element_array['amount'];
				}
			}
			echo json_encode(
				array(
					'elements' => $elements_data,
					'total_price' => $total_price,
					'system_thumbnail_url' => $system_thumbnail_url,
					'accessories' => $accessories_output
				)
			);
			return;
		}
		//Endof Kod systemów wentylacji



		if (!empty($splitter_id)) {
			$found_splitter = get_post($splitter_id);
		}

		if (!empty($packet_id)) {
			$found_packet = get_post($packet_id);
		}
		if (!empty($accessories)) {
			foreach ($accessories as &$accessory) {
				$post_types_filter_accessory = array(
					'title' 	=> $accessory[0],
					'post_type' => 'elementy_skladowe',
					'order'		=> 'ASC',
					'orderby'	=> 'title'
				);

				//Most important variable
				$active_accessory_object = get_posts($post_types_filter_accessory)[0];
				$accessories_output[] = array(
					'name' => $active_accessory_object->post_title,
					'unit_price' => get_field('cena', $active_accessory_object->ID),
					'total_price' => round(((get_field('cena', $active_accessory_object->ID)) * $accessory[1]), 2),
					'amount' => $accessory[1],
					'palettes' => ceil(floatval($accessory[1] / get_field('pal', $active_accessory_object->ID)))
				);
			}
		}

		$post_types_filter_system = array(
			'title' 	=> $system_and_diameter,
			'post_type' => 'system',
			'order'		=> 'ASC',
			'orderby'	=> 'title'
		);

		//Most important variable
		$active_system_object = get_posts($post_types_filter_system)[0];

		$system_id = intval($active_system_object->ID);
		$fieldset = get_field('typy_wysokosci', $system_id);
		$height_index = 0;
		$height_size = sizeof($fieldset);

		for ($active_checking_height_index = 0; $active_checking_height_index < $height_size; ++$active_checking_height_index) {
			$active_height = strval($fieldset[$active_checking_height_index]['wysokosc']);
			if ($active_height == $height) {
				$height_index = $active_checking_height_index;
				break;
			}
		}
		$airbrick_index = 0;
		$airbrick_size = $height_size;
		for ($active_checking_airbrick_index = 0; $active_checking_airbrick_index < $airbrick_size; ++$active_checking_airbrick_index) {
			$active_airbrick = strval($fieldset[$height_index]['typy_pustaka'][$active_checking_airbrick_index]['typ_pustaka']->post_title);
			if ($active_airbrick == $pustak) {
				$airbrick_index = $active_checking_airbrick_index;
				break;
			}
		}
		$active_elements_array = $fieldset[$height_index]['typy_pustaka'][$airbrick_index]['elementy_skladowe'];
		$system_thumbnail_url = get_the_post_thumbnail_url($active_system_object);
		$elements_data = array();

		if (!empty($active_elements_array)) {
			foreach ($active_elements_array as &$single_element_array) {
				$element_thumbnail_url = get_the_post_thumbnail_url(has_post_thumbnail($single_element_array['element_skladowy']));
				$amount_for_palette = get_field('pal', $single_element_array['element_skladowy']->ID);
				$weight = get_field('waga', $single_element_array['element_skladowy']->ID);
				if ($single_element_array['ilosc_elementow'] != 0) {
					$elements_data[] = array(
						'ID' => $single_element_array['element_skladowy']->ID,
						'name' => $single_element_array['element_skladowy']->post_title,
						'unit_price' => getElementPrice($single_element_array['element_skladowy']->ID, 1),
						'amount' => $single_element_array['ilosc_elementow'],
						'amount_for_palette' => $amount_for_palette,
						'weight' => $weight,
						'palettes' => ceil(floatval($amount_for_palette / $single_element_array['ilosc_elementow'])),
						'palettes_float' => floatval($amount_for_palette / $single_element_array['ilosc_elementow']),
						'total_element_price' => round(getElementPrice($single_element_array['element_skladowy']->ID, 1) * $single_element_array['ilosc_elementow'], 2),
						'thumbnail_url' => $element_thumbnail_url
					);
					if (!empty($splitter_id) && stripos($single_element_array['element_skladowy']->post_title, 'Trójnik przyłączeniowy') !== false) {
						$proper_active_index = count($elements_data) - 1;
						$elements_data[$proper_active_index]['name'] = $found_splitter->post_title;
						$elements_data[$proper_active_index]['unit_price'] = $elements_data[$proper_active_index]['unit_price'] + get_field('dodatkowa_cena', $found_splitter->ID);
						$elements_data[$proper_active_index]['total_element_price'] = round($elements_data[$proper_active_index]['unit_price'] * $elements_data[$proper_active_index]['amount'], 2);
					}

					if (!empty($packet_id) && stripos($single_element_array['element_skladowy']->post_title, 'pakiet') !== false) {
						$proper_active_index = count($elements_data) - 1;
						$elements_data[$proper_active_index]['name'] = $found_packet->post_title;
						$elements_data[$proper_active_index]['unit_price'] = $elements_data[$proper_active_index]['unit_price'] + get_field('dodatkowa_cena', $found_packet->ID);
						$elements_data[$proper_active_index]['total_element_price'] = round($elements_data[$proper_active_index]['unit_price'] * $elements_data[$proper_active_index]['amount'], 2);
					}
				} else {
					$elements_data[] = array(
						'ID' => $single_element_array['element_skladowy']->ID,
						'name' => $single_element_array['element_skladowy']->post_title,
						'unit_price' => getElementPrice($single_element_array['element_skladowy']->ID, 1),
						'amount' => $single_element_array['ilosc_elementow'],
						'amount_for_palette' => $amount_for_palette,
						'weight' => $weight,
						'palettes' => 0,
						'palettes_float' => 0,
						'total_element_price' => round(getElementPrice($single_element_array['element_skladowy']->ID, 1) * $single_element_array['ilosc_elementow'], 2),
						'thumbnail_url' => $element_thumbnail_url
					);
				}
			}
		}
		$total_price = 0;
		if (!empty($elements_data)) {
			foreach ($elements_data as &$single_element_array) {
				$total_price += $single_element_array['unit_price'] * $single_element_array['amount'];
			}
		}
		echo json_encode(
			array(
				'elements' => $elements_data,
				'total_price' => $total_price,
				'system_thumbnail_url' => $system_thumbnail_url,
				'accessories' => $accessories_output
			)
		);
		return;
	}
}

function custom_um_profile_query_make_posts($args = array())
{

	// Change the post type to our liking.

	$args['post_type'] = 'skorsten_kalkulator';

	return $args;
}

add_filter('um_profile_query_make_posts', 'custom_um_profile_query_make_posts', 12, 1);

add_action('wp_ajax_nopriv_rq_import_single_elements', 'rq_import_single_elements');
add_action('wp_ajax_rq_import_single_elements', 'rq_import_single_elements');
if (!function_exists('rq_import_single_elements')) {
	function rq_import_single_elements()
	{
		$terms_filter = array(
			'taxonomy' => 'category'
		);
		$avaiable_terms = get_terms($terms_filter);
		$elements = array();
		foreach ($avaiable_terms as &$term) {
			$elements[] = array(
				'name' => $term->name,
				'term_id' => $term->term_id,
			);
		}
		for ($i = 0; $i < sizeof($elements); $i++) {
			if ($elements[$i]['term_id'] != 1)
				$post_types_filter_elements = array(
					'numberposts' => -1,
					'post_type' => 'elementy_skladowe',
					'order'		=> 'ASC',
					'orderby'	=> 'title',
					'cat'		=> $elements[$i]['term_id']
				);
			else
				$post_types_filter_elements = array(
					'numberposts' => -1,
					'post_type' => 'elementy_skladowe',
					'order'		=> 'ASC',
					'orderby'	=> 'title',
					'category__not_in'		=> get_terms('category', array(
						'fields'        => 'ids'
					))
				);

			$found_elements = get_posts($post_types_filter_elements);
			if (!empty($found_elements)) {
				foreach ($found_elements as &$element) {
					$element_id = $element->ID;
					$elements[$i]['elements'][] = array(
						'title' => $element->post_title,
						'id'	=> $element->ID,
						'price'	=> get_field('cena', $element_id),
						'weight' => get_field('waga', $element_id),
						'amount_per_palette' => get_field('pal', $element_id)
					);
				}
			} else
				$elements[$i]['elements'] = array();
		}
		//UPRASZCZACZ NIESAMOWITY
		$elements_minimized = array();
		foreach ($elements as &$element_category) {
			if (!empty($element_category['elements'])) {
				foreach ($element_category['elements'] as &$single_element) {
					$elements_minimized[$element_category['name']][] = array(
						'title'			=>		$single_element['title'],
						'ID'			=>		$single_element['id'],
						'price'			=>		$single_element['price'],
						'weight'		=>		$single_element['weight'],
						'per_palette'	=>		$single_element['amount_per_palette']
					);
				}
			}
			$elements_minimized['categories'][] = $element_category['name'];
		}
		echo json_encode($elements_minimized);
	}
}

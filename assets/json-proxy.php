<?php

    $url = (isset($_GET['url']) ? $_GET['url'] : null);
    
    $ch = curl_init( $url );
    
    curl_exec( $ch );
    
    curl_close( $ch );

?>
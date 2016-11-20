<?
    $score = $_GET["score"];

    $scores = fopen("scores", "r");
    $best = fgets($scores);
    echo $best;
    if ($score < $best) $score = $best;
    fclose($scores);

    $scores = fopen("scores", "w");
    fwrite($scores, $score);
    fclose($scores);
    
?>
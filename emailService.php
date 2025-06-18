<?php

  class EmailService {

    private $smtpServer = 'smtp.gmail.com';
    private $smtpPort = 587;
    private $username = 'appcraftstudio.services@gmail.com'; 
    private $password = 'hrxp mgma fblq tizb'; 
    private $fromName = 'StadeFoot';

    public function sendReservationConfirmation($toEmail, $toName, $reservationData) {
    $subject = "Confirmation de votre réservation - Billet de match";

    $message = "
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; color: #333; }
            h2 { color: #2E86C1; }
            table { border-collapse: collapse; width: 100%; max-width: 600px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .footer { margin-top: 20px; font-size: 0.9em; color: #777; }
        </style>
    </head>
    <body>
        <h2>Bonjour {$toName},</h2>
        <p>Votre réservation a été confirmée avec succès ! Voici le récapitulatif :</p>

        <table>
            <tr>
                <th>Nom du match</th>
                <td>{$reservationData['match_name']}</td>
            </tr>
            <tr>
                <th>Section</th>
                <td>{$reservationData['section']}</td>
            </tr>
            <tr>
                <th>Quantité</th>
                <td>{$reservationData['quantity']}</td>
            </tr>
            <tr>
                <th>Prix total</th>
                <td>{$reservationData['total_price']} EUR</td>
            </tr>
            <tr>
                <th>ID réservation</th>
                <td>{$reservationData['reservation_id']}</td>
            </tr>
        </table>

        <div class='footer'>
            <p>StadeFoot &copy; " . date('Y') . "</p>
        </div>
    </body>
    </html>
    ";

    return $this->smtpSend($toEmail, $subject, $message);
}

    private function smtpSend($to, $subject, $body) {
        $socket = fsockopen($this->smtpServer, $this->smtpPort, $errno, $errstr, 30);
        if (!$socket) {
            echo "Erreur de connexion SMTP : $errstr ($errno)\n";
            return false;
        }

        $this->smtpRead($socket);
        $this->smtpWrite($socket, "EHLO localhost");
        $this->smtpRead($socket);

        $this->smtpWrite($socket, "STARTTLS");
        $this->smtpRead($socket);
        stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);

        $this->smtpWrite($socket, "EHLO localhost");
        $this->smtpRead($socket);

        $this->smtpWrite($socket, "AUTH LOGIN");
        $this->smtpRead($socket);
        $this->smtpWrite($socket, base64_encode($this->username));
        $this->smtpRead($socket);
        $this->smtpWrite($socket, base64_encode($this->password));
        $this->smtpRead($socket);

        $this->smtpWrite($socket, "MAIL FROM: <{$this->username}>");
        $this->smtpRead($socket);
        $this->smtpWrite($socket, "RCPT TO: <{$to}>");
        $this->smtpRead($socket);
        $this->smtpWrite($socket, "DATA");
        $this->smtpRead($socket);

        $headers = "From: {$this->fromName} <{$this->username}>\r\n";
        $headers .= "To: <{$to}>\r\n";
        $headers .= "Subject: {$subject}\r\n";
        $headers .= "MIME-Version: 1.0\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
        $headers .= "\r\n";

        $this->smtpWrite($socket, $headers . $body . "\r\n.");
        $this->smtpRead($socket);

        $this->smtpWrite($socket, "QUIT");
        fclose($socket);

        return true;
    }

    private function smtpWrite($socket, $cmd) {
        fwrite($socket, $cmd . "\r\n");
    }

    private function smtpRead($socket) {
        $response = '';
        while ($str = fgets($socket, 515)) {
            $response .= $str;
            if (substr($str, 3, 1) == ' ') break;
        }
        return $response;
    }
}

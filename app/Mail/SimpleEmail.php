<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SimpleEmail extends Mailable
{
    use Queueable, SerializesModels;

    public string $emailSubject;
    public string $emailBody;

    public function __construct(string $subject, string $body)
    {
        $this->emailSubject = $subject;
        $this->emailBody = $body;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->emailSubject,
        );
    }

    public function content(): Content
    {
        return new Content(
            htmlString: $this->emailBody,
        );
    }
}

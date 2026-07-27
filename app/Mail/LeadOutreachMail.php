<?php

namespace App\Mail;

use App\Models\SeoLead;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class LeadOutreachMail extends Mailable
{
    use Queueable, SerializesModels;

    public SeoLead $lead;
    public string $subjectText;
    public string $emailMessageBody;

    public function __construct(SeoLead $lead, string $subject, string $message)
    {
        $this->lead = $lead;
        $this->subjectText = $subject;
        $this->emailMessageBody = $message;
    }

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subjectText,
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.lead-outreach',
        );
    }
}

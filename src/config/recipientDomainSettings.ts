export const recipientDomainSettings = {
  'max-errors-per-connection': {
    description: 'This directive tells PowerMTA to break a connection after a certain amount of recipient level errors. The default is unlimited, meaning that PowerMTA will not break a connection due to a number of recipient level errors.',
    syntax: null,
    default: 'unlimited'
  },
  'check-spf-outbound': {
    description: 'Specifies whether PowerMTA should perform an SPF check on outbound messages to ensure compliance. If enabled and the check returns a Pass, message delivery continues; if instead it returns a TempError, the message is retried. Otherwise, the message bounces. To use this feature, you must currently configure a specific smtp-source-host or smtp-proxy-source-host (either at the global or VirtualMTA level).',
    syntax: null,
    default: 'false'
  },
  'dsn-format': {
    description: 'The default is standard, which has PowerMTA send a DSN in the standard format. If set to plain-text, the message/delivery-status portion of the DSN report is delivered instead of the full report. The portion is delivered within a mime-type of text/plain, thus allowing this data to pass through (overzealous) email firewalls that strip all attachments',
    syntax: "dsn-format { standard | plain-text }",
    default: 'standard'
  },
  'log-resolution': {
    description: 'Specifies that PowerMTA should log information on DNS (name and routing) lookups performed for the domain. This information is generally useful when debugging DNS-based connectivity problems (such as misconfigured DNS entries).',
    syntax: null,
    default: 'false'
  },
  'log-transfer-failures': {
    description: 'Specifies whether PowerMTA should write a warning to the logging file when connections fail while transferring messas contents (headers and body). Setting this directive to true may help when diagnosing delivery problems, especially duplicate or partial deliveries.',
    syntax: null,
    default: 'false'
  },
  'log-disabled-ips': {
    description: 'Turns on logging to show when and which IPs were disabled.',
    syntax: null,
    default: 'false'
  },
  'max-events-recorded': {
    description: 'Specifies the number of events PowerMTA is to record about the given domain. These events are not written to the logging file, but just recorded in memory. They can be viewed using the pmta show domains and the pmta show topdomains commands, or via the web interface. While recording such events can be very useful when investigating delivery problems, may have have an impact on memory consumption. Currently only error events are recorded.',
    syntax: null,
    default: '10'
  },
  'disable-acct-records': {
    description: 'Allows one to disable the creation of one or more than one type of accounting file record on a per queue (domain / virtualMTA) basis. For example, there are times when a user wants PowerMTA to discard certain messages without creating an accounting file record for these messages when discarded. By default, PowerMTA would create a d (delivered ) record for this, since it was delivered to discard, however the creation of a delivered record can be disabled with this option.',
    syntax: "disable-acct-records TYPES\nwhere TYPES can be one or more of d,b,t,tq",
    default: 'No default value specified.'
  },
  'deliver-local-dsn': {
    description: 'Specifies whether PowerMTA should generate DSN (bounce, delay or delivery) reports for messages received from the domain specified in this <domain>. Accounting records are still written normally, so this only affects the actual report emails. Deprecated Use <source> suppress-local-dsn instead.',
    syntax: null,
    default: 'true'
  },
  'bounce-after': {
    description: 'Determines the maximum amount of time PowerMTA will continue to try to deliver messages to the specified destination domain. Messages older than this time interval are bounced, i.e., a (non-)delivery report in DSN format will be sent back to the originator.',
    syntax: "bounce-after TIME-INTERVAL",
    default: '4d12h'
  },
  'bcc-upon-delivery': {
    description: 'Automatically BCC delivered emails to the given address. Use empty string () to clear any inherited value.',
    syntax: "bcc-upon-delivery EMAIL-ADDRESS",
    default: 'No default value specified.'
  },
  'allow-priority-interruption': {
    description: 'When set to no, this directive prevents interruptions by higher priority queues.',
    syntax: null,
    default: 'yes'
  },
  'allow-priority-interruption-during-transfer': {
    description: 'When set to no, the interruption is delayed until a connection is available. When set to yes, the interruption to an existing connection happens immediately. This directive applies to SMTP queues only.',
    syntax: null,
    default: 'no'
  },
  'queue-priority': {
    description: 'When PowerMTA needs to deliver email for a queue but no connection slots are available, it looks for a queue with lower priority currently connected and interrupts as many connections as needed, starting with the lowest priority connections and working its way up. A queues priority is set with a number between 0 (lowest) and 100 (highest); 50 by default.',
    syntax: null,
    default: '50'
  },
  'track-recipient-events': {
    description: 'Determines whether PowerMTA will keep track of the last 50 recipient delivery, bounce, and deferred events in memory.',
    syntax: null,
    default: 'false'
  },
  'delivery-priority': {
    description: 'No description available.',
    syntax: null,
    default: 'No default value specified.'
  },
  'notify-of-delay-every': {
    description: 'Sets how often PowerMTA checks to see if delay notification messages should be sent when using NOTIFY=DELAY option with RCPT TO command.',
    syntax: "notify-of-delay-every { TIME-INTERVAL | never }",
    default: '4h'
  },
  'dkim-sign': {
    description: 'Specifies whether or not PowerMTA should perform DKIM signing on messages destined for this domain. Domain keys must be configured for this directive to take effect. Please see the domain-key directive below for more information. Also accepts a special value: if-x-dkim-options-present as a way to enable DKIM signing only when an X-DKIM-Options header is present in the email. The directive continues to accept yes and no settings with their existing meaning.',
    syntax: null,
    default: 'false'
  },
  'dkim-add-body-limit': {
    description: 'Specify whether to add an “l=” tag with the body length to the DKIM signature, limiting the signed portion of the body. This allows further content to be added at the bottom of the message without invalidating the signature.',
    syntax: null,
    default: 'false'
  },
  'dkim-add-timestamp': {
    description: 'Specify whether to a timestamp to the DKIM signature.',
    syntax: null,
    default: 'false'
  },
  'dkim-algorithm': {
    description: 'Specify which DKIM signing algorithm to use.',
    syntax: "dkim-algorithm { rsa-sha1 | rsa-sha256 }",
    default: 'rsa-sha256'
  },
  'dkim-body-canon': {
    description: 'Specify which DKIM canonicalization to apply to the message body.',
    syntax: "dkim-body-canon { simple | relaxed }",
    default: 'relaxed'
  },
  'dkim-headers-canon': {
    description: 'Specify which DKIM canonicalization to apply to the message headers.',
    syntax: "dkim-headers-canon { simple | relaxed }",
    default: 'relaxed'
  },
  'dkim-expire-after': {
    description: 'Requests that an “x=” tag be included in the DKIM signature to indicate when it expires.',
    syntax: "dkim-expire-after { TIME-INTERVAL | never }",
    default: 'never'
  },
  'dkim-query-method': {
    description: 'Specifies the value of the q= tag in DKIM signatures.',
    syntax: "dkim-query-method STRING",
    default: 'No default value specified.'
  },
  'dkim-headers': {
    description: 'Specifies the headers to be used for DKIM signing.',
    syntax: null,
    default: 'No default value specified.'
  },
  'dkim-identity': {
    description: 'Specifies the domain or email address of the signing identity to be used when signing messages with DKIM.', 
    syntax: "dkim-identity { EMAIL-ADDRESS | DOMAIN | sender-or-from }",
    default: 'sender-or-from'
  },
  'dkim-identity-fallback': {
    description: 'Specifies an alternative DKIM identity to use if the primary identity isnt usable (usually because no keys are matched). This allows PowerMTA to use the dkim key for the From or Sender header if available ( eg. domain-key directive), but if the key is not available, PowerMTA switches to using the dkim-identity-fallback for signing (i= specified email address in the signature). Requires the use of dkim-identity.',
    syntax: null,
    default: 'No default value specified.'
  },
  'dkim-disallow-adding-headers': {
    description: 'Primarily used to minimize DKIM replay attacks, it allows one to specify headers that invalidate the DKIM signature if the headers are added after the DKIM signing. The directive takes a comma separated list of headers to include an extra time in the signatures h tag. Any headers listed in this directive that are also present in the original message will be signed as well.',
    syntax: "dkim-disallow-adding-headers HEADER-LIST",
    default: 'No default value specified.'
  },
  'queue-to': {
    description: 'No description available.',
    syntax: null,
    default: 'No default value specified.'
  },
  'source-ip-max-msg-rate': {
    description: 'IP rate limiting allows for controlling the number of attempted recipients on a per-hour, per-minute and per-second basis for each local IP address for each domain/VirtualMTA. Primarily used by sites that define multiple IPs in a single VirtualMTA, and that want to limit the attempted delivery rate for each local IP address in the VirtualMTA to the respective domains.',
    syntax: "source-ip-max-msg-rate CIDR { unlimited | 0 | N/[M]{h|hr|m|min|s|sec} }\nwhere d or day means per-day, h or hr means per-hour, m or min means per-minute and s or sec means per-second. N is required and must be non-zero, but M is optional. If M is not specified, it defaults to 1.",
    default: 'unlimited'
  },
  'max-msg-rate': {
    description: 'Specifies maximum attempted recipients to this domain per time interval.',
    syntax: "max-msg-rate { unlimited | 0 | N/[M]{d|day|h|hr|m|min|s|sec} }",
    default: 'unlimited'
  },
  'backoff-max-msg-rate': {
    description: 'This directive has the same function as max-msg-rate, and applies instead of max-msg-rate while a queue is in backoff mode. Both deliveries and attempted deliveries are counted towards the limit. The following error will be displayed in the web monitor when the rate limit is reached: “message rate limit reached (based on backoff-max-msg-rate in configuration)” When using rate limiting, it is best to establish a baseline without rate limiting to ensure that the limits set are having a positive impact on deliverability.',
    syntax: "backoff-max-msg-rate { unlimited | 0 | N/[M]{d|day|h|hr|m|min|s|sec} }\nwhere d or day means per-day, h or hr means per-hour, m or min means per-minute and s or sec means per-second. N is required and must be non-zero, but M is optional. If M is not specified, it defaults to 1.",
    default: 'If max-msg-rate is also configured for the same queue, the default is equal to the configured max-msg-rate. Else, it is unlimited.'
  },
  'max-msg-per-hour': {
    description: 'No description available.',
    syntax: null,
    default: 'No default value specified.'
  },
  'backoff-max-msg-per-hour': {
    description: 'No description available.',
    syntax: null,
    default: 'No default value specified.'
  },
  'max-data-volume-rate': {
    description: 'Specifies maximum amount of data that will be transferred to this domain in the given time interval.',
    syntax: "max-data-volume-rate { unlimited | 0 | N [{b|B|k|K|m|M|g|G|t|T}] /[X]{d|day|h|hr|m|min|s|sec} }\nFor the numerator, b or B means bytes, k or K means kilobytes, m or M means megabyte, g or G means gigabyte, t or T means terabyte. A number N must be specified in the numerator. If a data size suffix is not specified, it is assumed to mean bytes.\n\nFor the denominator, d or day means per-day, h or hr means per-hour, m or min means per-minute and s or sec means per-second. X is optional, but must be a number if specified. If X is not specified, it defaults to 1.",
    default: 'unlimited'
  },
  'backoff-max-data-volume-rate': {
    description: 'This directive has the same function as max-data-volume-rate, and applies instead of max-data-volume-rate while a queue is in backoff mode',
    syntax: "backoff-max-data-volume-rate { unlimited | 0 | N [{b|B|k|K|m|M|g|G|t|T}] /[X]{d|day|h|hr|m|min|s|sec} }\nFor the numerator, b or B means bytes, k or K means kilobytes, m or M means megabyte, g or G means gigabyte, t or T means terabyte. A number N must be specified in the numerator. If a data size suffix is not specified, it is assumed to mean bytes.\n\nFor the denominator, d or day means per-day, h or hr means per-hour, m or min means per-minute and s or sec means per-second. X is optional, but must be a number if specified. If X is not specified, it defaults to 1.",
    default: 'If max-data-volume-rate is also configured for the same queue, the default is equal to the configured max-data-volume-rate. Else, it is unlimited.'
  },
  'retry-after': {
    description: 'Specifies the retry interval or intervals for the domain/virtualMTA once the domain/virtualMTA is put in retry mode. The directive is a time interval(s), takes a single interval or comma separated list of intervals, with each having a number along with d for days, h for hours, m for minutes, or s for seconds, with no spaces between the parameters.',
    syntax: "retry-after TIME-INTERVAL-LIST",
    default: '10m'
  },
  'backoff-retry-after': {
    description: 'This directive has the same function as retry-after, and applies instead of retry-after while a queue is in backoff mode.',
    syntax: "backoff-retry-after TIME-INTERVAL-LIST",
    default: '1h'
  },
  'retry-recipients-after': {
    description: 'Specifies the minimum time interval to wait before retrying delivery for a recipient that previously received a 4XX (temp error) from the receiving gateway. Even if the domain/VirtualMTA is retried as per its retry-after setting, individual recipients do not get retried until the retry-recipients-after has elapsed.',
    syntax: "retry-recipients-after TIME-INTERVAL",
    default: '10m'
  },
  'retry-after-dns-error': {
    description: 'Specifies the retry interval for the domain/virtualMTA once the domain/virtualMTA is put in retry mode due to a DNS resolution error.',
    syntax: "retry-after-dns-error TIME-INTERVAL",
    default: '1m'
  },
  'backoff-notify': {
    description: 'Specifies email addresses to notify when any of the queues for the given domain enters or leaves backoff mode. Multiple addresses may be specified in a comma separated list. Use empty string () to clear any inherited value.',
    syntax: "backoff-notify EMAIL-ADDRESS-LIST",
    default: 'No default value specified.'
  },
  'disabled-source-ip-notify': {
    description: 'A comma separated list of email addresses that will be notified when a source IP is disabled, either via a command or through an smtp-pattern-list match, and when a source IP is enabled back again.Use empty string () to clear any inherited value.',
    syntax: "disabled-source-ip-notify EMAIL-ADDRESS-LIST",
    default: 'No default value specified.'
  },
  'backoff-to-normal-after': {
    description: 'Specifies a time interval after which a queue automatically goes back to normal mode. This directive is ignored if the queue was switched to backoff mode with the <smtp-pattern-list> action mode=backoff, and there was an accompanying backoff-to-normal-after action.',
    syntax: "backoff-to-normal-after { TIME-INTERVAL | never }",
    default: 'never'
  },
  'backoff-to-normal-after-delivery': {
    description: 'If enabled, this puts a queue back into normal mode after a successful delivery.',
    syntax: null,
    default: 'false'
  },
  'backoff-upon-all-sources-disabled': {
    description: 'If enabled, switches a queue into backoff mode when all source IPs become disabled, whether via command line command or when using the <smtp-pattern-list> function “disable-source-ip”. Note: SparkPost recommends using the “backoff-to-normal-after” directive in conjunction with this directive, since PowerMTA does not automatically put a queue back into normal mode when an IP address reverts back to being enabled.',
    syntax: null,
    default: 'false'
  },
  'reenable-source-ip-after': {
    description: 'Sets the interval of time for when a source IP disabled with the <smtp-pattern-list> function “disable-source-ip” is to be re-enabled, when no “reenable-after=” option is defined in the pattern action. This directive is ignored however when the “disable-source-ip” actions are defined with the accompanying “reenable-after=” option.',
    syntax: "reenable-source-ip-after { TIME-INTERVAL | never }",
    default: 'never'
  },
  'max-cold-virtual-mta-msg': {
    description: 'A per-domain max-cold-virtual-mta-msg N/day, default of 0, specifies how many messages go to the foo-cold vmta when VirtualMTA foo is selected. Re-selection occurs at message reception and over SMTP only. The value specified is the first X messages for that domain. The defined amount is set for delivery upon injection.',
    syntax: "max-cold-virtual-mta-msg DAILY-LIMITS\nwhere DAILY-LIMITS is a list of one or more rates of the form N/{d|day}",
    default: '0/d'
  },
  'reroute-to-virtual-mta': {
    description: 'Specifies that PowerMTA should reroute messages to the given VirtualMTA or VirtualMTA pool (See Rerouting to VirtualMTA pool). This can be set globally.Use empty string () to clear any inherited value.',
    syntax: "reroute-to-virtual-mta { VMTA-NAME | VMTA-POOL-NAME }",
    default: 'No default value specified.'
  },
  'backoff-reroute-to-virtual-mta': {
    description: 'Specifies that PowerMTA should reroute messages to the given VirtualMTA or VirtualMTA pool (See Rerouting to VirtualMTA pool) in case the queue enters backoff mode. For example, if messages are queued for example.port25.com/vmta1 and that queue enters backoff mode while backoff-reroute-to-virtual-mta is set to vmta2, all of its messages would be rerouted to the queue example.port25.com/vmta2. New messages entering the queue are also rerouted, as long as the queue remains in backoff mode.Use empty string () to clear any inherited value.',
    syntax: "type { smtp | pipe | file | discard | http-delivery }",
    default: 'smtp'
  },
  'allow-cancel-during-transfer': {
    description: 'Specifies whether PowerMTA should allow connections to this domain to be canceled (e.g., in order to shut down PowerMTA) while a messages contents (headers and body) are being transferred. Some mailers have been known to still deliver messages if the connection breaks before they are fully received, lastly causing partial and duplicate messages to be delivered as PowerMTA retries delivering. Setting this directive to false prevents PowerMTA from Canceling connections while messages are being transferred on it, but also possibly causes PowerMTA to take longer to shut down.',
    syntax: null,
    default: 'true'
  },
  'auth-username': {
    description: 'Specifies the user name to use when authenticating to the remote mailer. Authentication is attempted if the AUTH extension as well as a SASL authentication mechanism supported by PowerMTA are available at the remote mailer, and either auth-username or auth-password have non-empty values. Use empty string () to clear any inherited value. PowerMTA currently only supports the CRAM-MD5, LOGIN, and PLAIN authentication mechanisms.',
    syntax: null,
    default: 'No default value specified.'
  },
  'smtp-data-termination-timeout': {
    description: 'Allows for setting the amount of time that PowerMTA will wait for the final 250 ok response after sending the message body. Setting this value too low is likely to cause duplicates.',
    syntax: "smtp-data-termination-timeout TIME-INTERVAL",
    default: '10m'
  },
  'auth-password': {
    description: 'Specifies the password to use when authenticating to the remote mailer. Please see the auth-username directive above for more information. auth-password cannot contain a # as it will be interpreted as the start of comments.',
    syntax: null,
    default: 'No default value specified.'
  },
  'use-unencrypted-plain-auth': {
    description: 'Specifies whether PowerMTA should use PLAIN and/or LOGIN for authentication in case the connection is not encrypted (i.e., if STARTTLS is not being used).',
    syntax: null,
    default: 'false'
  },
  'smtp-553-means-invalid-mailbox': {
    description: 'Instructs PowerMTA whether to consider a 553 reply to a RCPT command as an 5.1.1 (invalid mailbox) error when enhanced status code is not returned by the remote gateway.',
    syntax: null,
    default: 'yes'
  },
  'smtp-421-means-mx-unavailable': {
    description: 'If set to “yes”, PowerMTA will immediately break the connection upon receiving a 421 error and subsequently attempt a new connection to the next MX record listed in DNS. The default setting of “no” will cause PowerMTA to reset the connection and then reuse the same connection for additional recipients.',
    syntax: null,
    default: 'no'
  },
  'replace-smtp-421-service-response': {
    description: 'When enabled, this replaces the SMTP response after the 421 code and after any enhanced status code with service unavailable, thus preventing any email addresses, etc. that may be included in that response from being used in bounces. The original message is still passed in for pattern matching, so that these continue to work normally.',
    syntax: null,
    default: 'false'
  },
  'bounce-upon-no-mx': {
    description: 'If set to true and no MX record(s) are found for the domain, all emails in the queue bounce immediately.',
    syntax: "bounce-upon-no-mx ( true | false | TIME-INTERVAL | never }",
    default: 'false'
  },
  'bounce-upon-5xx-greeting': {
    description: 'Specifies whether PowerMTA should immediately bounce all messages for the domain when receiving a 5xx SMTP greeting. email protocols mandate this default behavior, however there exist many misconfigured mailers on the network, causing email to be lost unnecessarily. If this directive is set to false, PowerMTA will regard 5xx greetings as a temporary error and try delivering the messages to any secondary MX mailers, as well continue retrying delivery until the bounce-after interval expires.',
    syntax: null,
    default: 'true'
  },
  'bounce-upon-pix-transfer-failure': {
    description: 'This directive is identical to the bounce-upon-transfer-failure directive below, except that the message is only bounced if a Cisco PIX Firewall is detected at the receiving site. Detection is performed based on the SMTP greeting line: if it contains at least ten asterisks, a PIX firewall is detected.',
    syntax: null,
    default: 'false'
  },
  'bounce-upon-transfer-failure': {
    description: 'Specifies whether PowerMTA should immediately bounce a message whose delivery failed while its contents (message headers and body) were being transferred. Normally, PowerMTA would not immediately bounce the message, but continue trying until it becomes older than the bounce-after interval. Due to deficiencies in the SMTP protocol (See RFC 1047) and in the receiving mail servers, if the TCP connection fails while the contents are being transmitted, there is some risk that various copies of the same message will be delivered, some of which possibly with only partial contents. By enabling this directive, you instruct PowerMTA to bounce the message immediately after the first failed transfer attempt. This effectively prevents sending out duplicates, but may also cause the recipient to never receive the message, or receive only one (possibly partial) copy of it.',
    syntax: null,
    default: 'false'
  },
  'connect-timeout': {
    description: 'Specifies the maximum amount of time that PowerMTA waits for an outgoing SMTP connection to be established.',
    syntax: "connect-timeout TIME-INTERVAL",
    default: '2m'
  },
  'smtp-greeting-timeout': {
    description: 'Specifies the amount of time to wait for the initial SMTP 220 greeting message to be received after the connection is accepted.',
    syntax: "smtp-greeting-timeout TIME-INTERVAL",
    default: '5m'
  },
  'data-send-timeout': {
    description: 'Specifies the maximum amount of time that PowerMTA waits for a chunk of data (message contents and body) to be sent over an outgoing SMTP connection. For full compliance with RFC 2821, this timeout needs to be at least three minutes.',
    syntax: "data-send-timeout TIME-INTERVAL",
    default: '3m'
  },
  'ignore-8bitmime': {
    description: 'Specifies whether PowerMTA should ignore the 8BITMIME extension even when supported by the receiving mailer.',
    syntax: null,
    default: 'false'
  },
  'ignore-chunking': {
    description: 'Specifies whether PowerMTA should ignore the CHUNKING extension even when supported by the receiving mailer. Setting this directive to true may be useful for debugging message transfer problems.',
    syntax: null,
    default: 'false'
  },
  'ignore-pipelining': {
    description: 'Specifies whether PowerMTA should ignore the PIPELINING extension even when supported by the receiving mailer. Setting this directive to true may be useful for debugging message transfer problems.',
    syntax: null,
    default: 'false'
  },
  'ignore-dsn': {
    description: 'Specifies whether PowerMTA should ignore the DSN extension even when supported by the receiving mailer (seen in the 250 responses after connecting).',
    syntax: null,
    default: 'false'
  },
  'max-msg-per-connection': {
    description: 'Specifies the maximum number of messages delivered within a single connection. Normally it is most efficient to deliver as many messages as possible per connection, but in special circumstances it may be desirable to have PowerMTA close the connection and reconnect before delivering more messages. A value of zero means no limit is imposed.',
    syntax: null,
    default: '0'
  },
  'max-rcpt-per-transaction': {
    description: 'Specifies the maximum number of recipients passed with each message. For example, if a message is submitted including 5,000 recipients for a single domain, and max-rcpt-per-message for that domain is set to 3,000, PowerMTA will transfer the message twice, once for 3,000 recipients and again for the remaining 2,000 recipients. Smaller settings increase parallelism by allowing the same message to be transferred over several connections to the same domain, but also reduce efficiency, since the message contents are transferred several times. max-rcpt-per-transaction is an alias to max-rcpt-per-message.',
    syntax: null,
    default: '1000'
  },
  'max-rcpt-per-message': {
    description: 'Specifies the maximum number of recipients accepted in each message. If set to zero or unlimited, no explicit limit is enforced.',
    syntax: "max-rcpt-per-message { N | unlimited }",
    default: '0'
  },
  'max-smtp-out': {
    description: 'Specifies the maximum number of simultaneous connections to be opened for this queue. This limit is independent of connections to the same domain but from a different VMTA.',
    syntax: null,
    default: '20'
  },
  'backoff-max-smtp-out': {
    description: 'Specifies the maximum number of simultaneous connections to be opened for this domain when in backoff mode.',
    syntax: null,
    default: '20'
  },
  'max-smtp-out-per-source-ip': {
    description: 'No description available.',
    syntax: null,
    default: 'No default value specified.'
  },
  'source-ip-max-smtp-out': {
    description: 'Specifies the maximum number of simultaneous connections to be opened for this domain for a given local source IP.',
    syntax: "source-ip-max-smtp-out CIDR N",
    default: 'unlimited'
  },
  'smtp-out-rampup-interval': {
    description: 'Specifies the minimum amount of time PowerMTA waits before opening another connection to deliver email from the queue. This can reduce the number of connections needed and help avoid hitting a connection limit.',
    syntax: "smtp-out-rampup-interval TIME-INTERVAL",
    default: '0'
  },
  'max-connect-rate': {
    description: 'Specifies the maximum number of connections to be opened for this domain during the specified time period. See max-msg-rate for more examples on rate limit syntax that can be used with this directive.',
    syntax: "max-connect-rate { unlimited | 0 | N/[M]{d|day|h|hr|m|min|s|sec} }\nwhere d or day means per-day, h or hr means per-hour, m or min means per-minute and s or sec means per-second. N is required and must be non-zero, but M is optional. If M is not specified, it defaults to 1.",
    default: 'unlimited'
  },
  'source-ip-max-connect-rate': {
    description: 'Specifies the maximum number of connections to be opened during the specified time period when using the given local source IP for this domain/vmta (i.e. queue). See max-msg-rate for more examples on rate limit syntax that can be used with this directive.',
    syntax: "source-ip-max-connect-rate CIDR { unlimited | 0 | N/[M]{d|day|h|hr|m|min|s|sec} }\nwhere d or day means per-day, h or hr means per-hour, m or min means per-minute and s or sec means per-second. N is required and must be non-zero, but M is optional. If M is not specified, it defaults to 1.",
    default: 'unlimited'
  },
  'connection-idle-timeout': {
    description: 'Specifies the maximum amount of time that PowerMTA waits for another email to be submitted for delivery once there is no remaining email to deliver in the queue. This can reduce the number of connections needed and help avoid hitting a connection limit for opening too many connections within a short interval. The maximum value is 10m. See also smtp-out-rampup-interval.',
    syntax: "connection-idle-timeout TIME-INTERVAL",
    default: '0'
  },
  'source-ip-max-data-volume-rate': {
    description: 'Specifies maximum amount of data that will be transferred to this domain in the given time interval when using the given local source IP for this domain/vmta (i.e. queue). See max-data-volume-rate for more examples on rate limit syntax that can be used with this directive.',
    syntax: "source-ip-max-data-volume-rate CIDR { unlimited | 0 | N [{b|B|k|K|m|M|g|G|t|T}] /[X]{d|day|h|hr|m|min|s|sec} }\nFor the numerator, b or B means bytes, k or K means kilobytes, m or M means megabyte, g or G means gigabyte, t or T means terabyte. A number N must be specified in the numerator. If a data size suffix is not specified, it is assumed to mean bytes.\n\nFor the denominator, d or day means per-day, h or hr means per-hour, m or min means per-minute and s or sec means per-second. X is optional, but must be a number if specified. If X is not specified, it defaults to 1.\n\nSee max-data-volume-rate for more examples on rate limit syntax that can be used with this directive.",
    default: 'unlimited'
  },
  'backoff-max-connect-rate': {
    description: 'Specifies the maximum number of connections to be opened for this domain during the specified time period when in backoff mode. See max-msg-rate for more examples on rate limit syntax that can be used with this directive.',
    syntax: "backoff-max-connect-rate { unlimited | 0 | N/[M]{d|day|h|hr|m|min|s|sec} }\nwhere d or day means per-day, h or hr means per-hour, m or min means per-minute and s or sec means per-second. N is required and must be non-zero, but M is optional. If M is not specified, it defaults to 1.",
    default: 'If max-connect-rate is also configured for the same queue, the default is equal to the configured max-connect-rate. Else, it is unlimited.'
  },
  'retry-upon-new-mail': {
    description: 'Specifies if PowerMTA should immediately schedule delivery of a message when it is received if the queue to which it is injected is already in retry mode. If set to true and a queue is in retry mode, new mail injected into that queue will cause the queue to be scheduled for delivery.',
    syntax: null,
    default: 'false'
  },
  'pix-bug-workaround': {
    description: 'Some versions of the Cisco PIX firewall have a bug (bug ID CSCds90792) in its fixup smtp command in that it rejects email (causing duplicates to be delivered) if the final . sequence is split across various TCP frames. This directive instructs PowerMTA, in case it detects a PIX firewall, to send the final . in a frame of its own, making it almost certain to arrive at the receiving site in a single frame. Detection is performed based on the SMTP greeting line: if it contains at least ten asterisks, a PIX firewall is detected.',
    syntax: null,
    default: 'true'
  },
  'route': {
    description: 'No description available.',
    syntax: null,
    default: 'No default value specified.'
  },
  'default-smtp-port': {
    description: 'Allows specifying the TCP port to use for delivering over SMTP (unless overridden by smtp-hosts). This can be used to simplify the setup when multiple PowerMTAs communicate through a NAT (network address translation) device, since the NAT configuration can key on the destination port rather than require individual local source IPs for each externally visible IP address.',
    syntax: null,
    default: '25'
  },
  'smtp-hosts': {
    description: 'Overrides or modifies the normal DNS-based routing, instructing PowerMTA to deliver to specific hosts or to look up an MX record for a different domain.',
    syntax: null,
    default: 'No default value specified.'
  },
  'smtp-pattern-list': {
    description: 'Specifies that the given SMTP pattern list is to be used in connections to the given domain. See <smtp-pattern-list> Directives for more information.',
    syntax: "smtp-pattern-list NAME",
    default: 'No default value specified.'
  },
  'assume-delivery-upon-data-termination-timeout': {
    description: 'If enabled and the connection times out while waiting for the reply to the . after a DATA or for the reply to the last BDAT segment, PowerMTA assumes that the delivery was successful. May result in duplicate messages if used when not needed.',
    syntax: null,
    default: 'false'
  },
  'disable-mx-rollup': {
    description: 'Controls whether MX rollup should be performed for the domain. When set to true, DNS results for the domain are not checked against any MX rollup patterns configured in the system.',
    syntax: null,
    default: 'false'
  },
  'include': {
    description: 'This directive can be used at domain level to specify an additional configuration file to process. This can be used, for example, to facilitate maintenance of the configuration files across multiple hosts, by storing those settings which differ from host to host in a separate file and including it from the main (common) file. Wildcards may be used. A URL can be specified in place of a filename to obtain the file via HTTP. The URL must be an absolute URL, must be prefixed by either http or https, and should not contain any userinfo, query-string or fragment components.',
    syntax: "include { FILENAME | scheme://host[:port][/path] }",
    default: 'true'
  }
};
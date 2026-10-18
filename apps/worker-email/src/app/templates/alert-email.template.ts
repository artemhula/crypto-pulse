export interface AlertEmailData {
  ticker: string;
  condition: 'ABOVE' | 'BELOW';
  targetPrice: number;
  currentPrice: number;
  triggeredAt: Date;
}

export interface AlertEmailContent {
  subject: string;
  html: string;
  text: string;
}

const BRAND = 'pulsee.';
const FONT =
  "'Geist', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, " +
  'Helvetica, Arial, sans-serif';
const FONT_LINK =
  'https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&display=swap';
const BRAND_GRADIENT = 'linear-gradient(90deg, #6020D0 0%, #B89AF8 100%)';

const CONDITION_STYLES = {
  ABOVE: { label: 'ABOVE', arrow: '▲', accent: '#16A34A', soft: '#DCFCE7' },
  BELOW: { label: 'BELOW', arrow: '▼', accent: '#DC2626', soft: '#FEE2E2' },
} as const;

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
      })[char] as string,
  );

const formatPrice = (value: number) =>
  value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: value >= 1 ? 2 : 8,
  });

const formatTimestamp = (value: Date) =>
  value.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  });

const renderStat = (label: string, value: string) => `
                      <tr>
                        <td
                          class="stat-label"
                          style="padding: 8px 0 8px 0; font-family: ${FONT}; font-size: 15px; color: #737373;"
                        >
                          ${label}
                        </td>
                        <td
                          class="stat-value"
                          align="right"
                          style="padding: 8px 0 8px 0; font-family: ${FONT}; font-size: 15px; font-weight: 600; color: #0a0a0a; white-space: nowrap;"
                        >
                          ${value}
                        </td>
                      </tr>`;

export const renderAlertEmail = (
  data: AlertEmailData,
  appUrl?: string,
): AlertEmailContent => {
  const ticker = data.ticker.toUpperCase();
  const safeTicker = escapeHtml(ticker);
  const targetPrice = formatPrice(data.targetPrice);
  const currentPrice = formatPrice(data.currentPrice);
  const timestamp = formatTimestamp(data.triggeredAt);
  const condition = CONDITION_STYLES[data.condition];
  const direction = data.condition.toLowerCase();
  const manageUrl = appUrl ? `${appUrl.replace(/\/$/, '')}/alerts` : undefined;

  return {
    subject: `🔔 ${ticker} crossed ${direction} ${targetPrice} | ${BRAND}`,
    text: [
      `${BRAND} price alert`,
      '',
      `${ticker} crossed ${direction} ${targetPrice}.`,
      `Current price: ${currentPrice}`,
      `Triggered at: ${timestamp} UTC`,
      manageUrl ? `Manage your alerts: ${manageUrl}` : '',
    ]
      .filter(Boolean)
      .join('\n'),
    html: `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light dark" />
    <link rel="stylesheet" href="${FONT_LINK}" />
    <title>${safeTicker} price alert</title>
    <style>
      body {
        margin: 0;
        padding: 0;
        background-color: #f5f5f5;
        font-family: ${FONT};
      }
      table {
        border-collapse: collapse;
      }
      .preheader {
        display: none;
        max-height: 0;
        overflow: hidden;
        opacity: 0;
      }
      @media only screen and (max-width: 560px) {
        .container {
          width: 100% !important;
        }
        .stat-label,
        .stat-value {
          font-size: 14px !important;
        }
      }
      @media (prefers-color-scheme: dark) {
        .page {
          background-color: #0a0a0a !important;
        }
        .card {
          background-color: #171717 !important;
          border-color: #262626 !important;
        }
        .heading,
        .ticker,
        .stat-value {
          color: #fafafa !important;
        }
        .subheading,
        .stat-label,
        .footer,
        .divider {
          color: #a1a1a1 !important;
        }
        .divider {
          background-color: #262626 !important;
        }
      }
    </style>
  </head>
  <body class="page">
    <div class="preheader">
      ${safeTicker} is now ${currentPrice}, past your ${direction} level of
      ${targetPrice}.
    </div>
    <table
      role="presentation"
      width="100%"
 cellpadding="0"
      cellspacing="0"
      class="page"
      style="background-color: #f5f5f5; padding: 32px 12px;"
    >
      <tr>
        <td align="center">
          <table
            role="presentation"
            width="100%"
            cellpadding="0"
            cellspacing="0"
            class="container"
            style="width: 560px; max-width: 560px;"
          >
            <tr>
              <td style="padding: 0 0 20px 0;">
                <span
                  style="font-family: ${FONT}; font-size: 26px; font-weight: 700; color: #0a0a0a; letter-spacing: -0.02em;"
                  class="heading"
                  >${BRAND}</span
                >
              </td>
            </tr>
            <tr>
              <td
                class="card"
                style="background-color: #ffffff; border: 1px solid #e5e5e5; border-radius: 16px; overflow: hidden;"
              >
                <tr>
                  <td
                    style="height: 4px; line-height: 4px; font-size: 0; background: ${BRAND_GRADIENT};"
                  >
                    &nbsp;
                  </td>
                </tr>
                <tr>
                  <td style="padding: 32px 32px 8px 32px;">
                    <table
                      role="presentation"
                      cellpadding="0"
                      cellspacing="0"
                      style="width: 100%;"
                    >
                      <tr>
                        <td
                          class="ticker"
                          style="font-family: ${FONT}; font-size: 34px; font-weight: 700; color: #0a0a0a; letter-spacing: -0.03em; line-height: 1.1;"
                        >
                          ${safeTicker}
                        </td>
                        <td align="right" valign="middle">
                          <span
                            style="display: inline-block; padding: 6px 12px; border-radius: 999px; background-color: ${condition.soft}; color: ${condition.accent}; font-family: ${FONT}; font-size: 13px; font-weight: 700; letter-spacing: 0.04em;"
                            >${condition.arrow} ${condition.label}</span
                          >
                        </td>
                      </tr>
                    </table>
                    <p
                      class="subheading"
                      style="margin: 12px 0 0 0; font-family: ${FONT}; font-size: 15px; line-height: 1.5; color: #737373;"
                    >
                      Price moved ${direction} your level of
                      ${targetPrice}.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 24px 32px 0 32px;">
                    <div
                      class="divider"
                      style="height: 1px; line-height: 1px; font-size: 0; background-color: #e5e5e5;"
                    >
                      &nbsp;
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="padding: 20px 32px 32px 32px;">
                    <table
                      role="presentation"
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                    >
                      ${renderStat('Target level', targetPrice)}
                      ${renderStat('Current price', currentPrice)}
                    </table>
                  </td>
                </tr>
                ${
                  manageUrl
                    ? `<tr>
                  <td style="padding: 0 32px 32px 32px;">
                    <table
                      role="presentation"
                      cellpadding="0"
                      cellspacing="0"
                      style="width: 100%;"
                    >
                      <tr>
                        <td align="center">
                          <a
                            href="${escapeHtml(manageUrl)}"
                            style="display: inline-block; padding: 13px 28px; border-radius: 10px; background-color: #171717; color: #fafafa; font-family: ${FONT}; font-size: 15px; font-weight: 600; text-decoration: none;"
                            >Manage alerts</a
                          >
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>`
                    : ''
                }
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`,
  };
};

const parseSender = (value) => {
  const input = String(value || '').trim();
  const match = input.match(/^(?:.*?)<\s*([^<>\s]+@[^<>\s]+)\s*>$/);
  const address = match ? match[1] : input;
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(address)) return null;
  return { address, name: match ? input.slice(0, input.lastIndexOf('<')).trim().replace(/^['"]|['"]$/g, '') : '' };
};

export const getMailConfig = () => {
  const host = process.env.MAIL_HOST?.trim();
  const user = process.env.MAIL_USER?.trim();
  // Gmail displays app passwords in groups separated by spaces. Those spaces
  // are formatting and must not be sent as part of the SMTP password.
  const pass = process.env.MAIL_PASSWORD?.replace(/\s/g, '');
  const sender = parseSender(process.env.MAIL_FROM);
  const port = Number(process.env.MAIL_PORT || 587);
  if (!host || !user || !pass || !sender || !Number.isInteger(port) || port < 1 || port > 65535) return null;

  return {
    host,
    port,
    secure: process.env.MAIL_SECURE === 'true' || port === 465,
    user,
    pass,
    fromAddress: sender.address,
    fromName: process.env.MAIL_FROM_NAME?.trim() || sender.name || 'NextStep AI',
  };
};

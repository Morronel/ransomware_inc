// Ransomware Inc. — real-world labels
//
// Each entry vector and upgrade is mapped to the closest publicly documented TTP.
// IDs use MITRE ATT&CK or related public catalogues; popular tool names are kept as flavour cues.
// No commands, payloads, or operational instructions are stored here.
window.RI = window.RI || {};

RI.LABELS = {
  vectors: {
    phish:  { id: 'T1566.002', name: 'Spearphishing Link (Evilginx)' },
    creds:  { id: 'T1555', name: 'Credentials from Password Stores (Combo Lists)' },
    web:    { id: 'T1190', name: 'Exploit Public-Facing Application (OWASP Top 10)' },
    vpn:    { id: 'T1133', name: 'External Remote Services (VPN)' },
    vendor: { id: 'T1195.002', name: 'Compromise Software Supply Chain (SolarWinds-style)' },
    broker: { id: 'T1650', name: 'Acquire Access (IAB Marketplace)' }
  },
  upgrades: {
    // ACCESS (credentials part)
    cr_map:     { id: 'T1087.002', name: 'Domain Account Discovery (BloodHound)' },
    cr_cookie:  { id: 'T1539', name: 'Steal Web Session Cookie (Evilginx)' },
    cr_dump:    { id: 'T1003.001', name: 'LSASS Memory (Mimikatz)' },
    cr_fatigue: { id: 'T1621', name: 'Multi-Factor Authentication Request Generation' },
    cr_roast:   { id: 'T1558.003', name: 'Kerberoasting (Rubeus)' },
    cr_exploit: { id: 'T1068', name: 'Exploitation for Privilege Escalation (CVE PoC)' },
    cr_reuse:   { id: 'T1550.002', name: 'Pass the Hash (Impacket)' },
    cr_sync:    { id: 'T1003.006', name: 'DCSync (Mimikatz)' },
    cr_sniff:   { id: 'T1040', name: 'Network Sniffing (Responder)' },
    cr_golden:  { id: 'T1558.001', name: 'Golden Ticket (Mimikatz)' },
    // ACCESS (movement part)
    mv_scan:     { id: 'T1046', name: 'Network Service Discovery (Nmap)' },
    mv_shares:   { id: 'T1021.002', name: 'SMB/Windows Admin Shares (PsExec)' },
    mv_intphish: { id: 'T1534', name: 'Internal Spearphishing' },
    mv_remexp:   { id: 'T1210', name: 'Exploitation of Remote Services (Metasploit)' },
    mv_desk:     { id: 'T1021.001', name: 'Remote Desktop Protocol (RDP)' },
    mv_taint:    { id: 'T1204.002', name: 'Malicious File (LNK Trap)' },
    mv_mgmt:     { id: 'T1219', name: 'Remote Access Software (RMM Abuse)' },
    mv_deploy:   { id: 'T1072', name: 'Software Deployment Tools (SCCM)' },
    mv_hijack:   { id: 'T1550.004', name: 'Web Session Cookie (AitM)' },
    mv_policy:   { id: 'T1484.001', name: 'Group Policy Modification (GPO)' },
    // EVADE
    ev_obf:    { id: 'T1027', name: 'Obfuscated Files or Information (Packers)' },
    ev_run:    { id: 'T1547.001', name: 'Registry Run Keys / Startup Folder' },
    ev_web:    { id: 'T1071.001', name: 'Web Protocols (HTTPS C2)' },
    ev_task:   { id: 'T1053.005', name: 'Scheduled Task (Windows)' },
    ev_inject: { id: 'T1055', name: 'Process Injection (Cobalt Strike)' },
    ev_lotl:   { id: 'T1059.001', name: 'PowerShell (LOLBas)' },
    ev_wipe:   { id: 'T1070.001', name: 'Clear Windows Event Logs' },
    ev_mask:   { id: 'T1036', name: 'Masquerading (EDR Blend-in)' },
    ev_proxy:  { id: 'T1090.003', name: 'Multi-hop Proxy (Relay Mesh)' },
    ev_blind:  { id: 'T1562.001', name: 'Impair Defenses: Disable or Modify Tools' },
    // IMPACT
    im_collect: { id: 'T1005', name: 'Data from Local System' },
    im_payload: { id: 'T1486', name: 'Data Encrypted for Impact' },
    im_pack:    { id: 'T1560.001', name: 'Archive via Utility (7-Zip)' },
    im_cloud:   { id: 'T1567.002', name: 'Exfiltration to Cloud Storage (Mega)' },
    im_shadow:  { id: 'T1490', name: 'Inhibit System Recovery (vssadmin)' },
    im_leak:    { id: 'T1657', name: 'Financial Theft (Double Extortion)' },
    im_stop:    { id: 'T1489', name: 'Service Stop' },
    im_backup:  { id: 'T1485', name: 'Data Destruction (Backup Wipe)' },
    im_blitz:   { id: 'T1486', name: 'Data Encrypted for Impact (Intermittent Encryption)' },
    im_safe:    { id: 'T1562.001', name: 'Impair Defenses: Disable or Modify Tools (Safe Mode)' },
    im_auto:    { id: 'T1020', name: 'Automated Exfiltration' },
    im_hyper:   { id: 'T1486', name: 'Data Encrypted for Impact (Hypervisor)' },
    // WIPER (APT)
    ch_wiper:   { id: 'T1561.001', name: 'Disk Content Wipe' },
    ch_boot:    { id: 'T1561.001', name: 'Disk Content Wipe (Boot Record)' },
    ch_zero:    { id: 'T1561', name: 'Disk Wipe (Zero-Fill)' },
    ch_backup:  { id: 'T1485', name: 'Data Destruction (Backup Burn)' },
    ch_bomb:    { id: 'T1053.005', name: 'Scheduled Task (Logic Bomb)' },
    ch_brick:   { id: 'T1485', name: 'Data Destruction (Firmware Brick)' },
    ch_kill:    { id: 'T1562.001', name: 'Impair Defenses: Disable or Modify Tools (EDR Kill)' },
    ch_scorch:  { id: 'T1485', name: 'Data Destruction (Scorched Earth)' },
    // COLLECT (APT)
    ap_collect: { id: 'T1005', name: 'Data from Local System' },
    ap_stage:   { id: 'T1074.001', name: 'Local Data Staging' },
    ap_sleep:   { id: 'T1573', name: 'Encrypted Channel (Sleeper Implant)' },
    ap_mail:    { id: 'T1114.003', name: 'Email Forwarding Rule' },
    ap_hours:   { id: 'T1071.001', name: 'Web Protocols (Office-Hours C2)' },
    ap_nest:    { id: 'T1547.001', name: 'Registry Run Keys / Startup Folder (Deep Nest)' },
    ap_tunnel:  { id: 'T1572', name: 'Protocol Tunneling (Cloudflare Tunnel)' },
    ap_flag:    { id: 'T1036', name: 'Masquerading (False Flag)' },
    ap_bridge:  { id: 'T1199', name: 'Trusted Relationship (Supplier Bridge)' },
    ap_ghost:   { id: 'T1070', name: 'Indicator Removal (Ghost Cleanup)' },
    // COPYPASTA (Script Kiddies)
    sk_gpt:     { id: 'T1593.001', name: 'Search Open Websites/Domains (AI Recon)' },
    sk_combo:   { id: 'T1059.001', name: 'PowerShell (Combo Script)' },
    sk_video:   { id: 'T1203', name: 'Exploitation for Client Execution (Video Walkthrough)' },
    sk_rat:     { id: 'T1219', name: 'Remote Access Software (Cracked RAT)' },
    sk_guide:   { id: 'T1068', name: 'Exploitation for Privilege Escalation (Paid Guide)' },
    sk_paste:   { id: 'T1059.001', name: 'PowerShell (Forum PoC)' },
    sk_thread:  { id: 'T1078.002', name: 'Domain Accounts (Overprivileged User)' },
    sk_docs:    { id: 'T1027', name: 'Obfuscated Files or Information (Quiet Mode)' },
    // CLOUT (Script Kiddies)
    sk_chat:    { id: 'T1593.001', name: 'Search Open Websites/Domains (Hacker Chat)' },
    sk_brag:    { id: 'T1589.001', name: 'Social Media (Self-Doxxing)' },
    sk_beg:     { id: 'T1566.002', name: 'Spearphishing Link (Credential Begging)' },
    sk_alt:     { id: 'T1098', name: 'Account Manipulation (Alt Account)' },
    sk_vpn:     { id: 'T1090.002', name: 'External Proxy (Free VPN)' },
    sk_pfp:     { id: 'T1589.001', name: 'Social Media (Edgy Avatar)' },
    sk_mentor:  { id: 'T1562.001', name: 'Impair Defenses: Disable or Modify Tools (OPSEC Mentor)' },
    // YOLO (Script Kiddies)
    sk_spam:    { id: 'T1566.002', name: 'Spearphishing Link (Spam Blast)' },
    sk_usb:     { id: 'T1091', name: 'Replication Through Removable Media (Marketplace USB)' },
    sk_admin:   { id: 'T1078.001', name: 'Default Accounts (admin/admin)' },
    sk_booter:  { id: 'T1498', name: 'Network Denial of Service (Booter)' },
    sk_energy:  { id: 'T1021.001', name: 'Remote Desktop Protocol (All-Nighter)' },
    sk_google:  { id: 'T1595.002', name: 'Vulnerability Scanning (Google the Error)' },
    sk_pray:    { id: 'T1053.005', name: 'Scheduled Task (Prayer Persistence)' }
  }
};

// Returns { id, name } when at least one field is filled, otherwise null.
RI.label = function (kind, key) {
  var group = RI.LABELS && RI.LABELS[kind], l = group && group[key];
  if (!l || (!l.id && !l.name)) return null;
  return l;
};
RI.labelText = function (kind, key) {
  var l = RI.label(kind, key);
  if (!l) return '';
  return [l.id, l.name].filter(Boolean).join(' · ');
};

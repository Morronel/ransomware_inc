// Ransomware Inc. — real-world labels (fill these in yourself)
//
// Every entry vector and upgrade in the game has a flavour name (all four crews' trees are listed below). Here you can attach the real-world
// framework label it stands for, e.g. a technique ID and its official name, a CWE number or an OWASP category.
//
//   id:   short code shown as a tag, e.g. 'T0000' or 'CWE-000'
//   name: the official name shown next to it
//
// Anything left empty is simply not shown. Labels appear on the setup cards, in the EVOLVE tree,
// in the SOC feed and in the end-of-run report. No game code needs to change.
window.RI = window.RI || {};

RI.LABELS = {
  vectors: {
    phish:  { id: '', name: '' },
    creds:  { id: '', name: '' },
    web:    { id: '', name: '' },
    vpn:    { id: '', name: '' },
    usb:    { id: '', name: '' },
    vendor: { id: '', name: '' },
    broker: { id: '', name: '' }
  },
  upgrades: {
    // CREDS
    cr_map:     { id: '', name: '' },
    cr_cookie:  { id: '', name: '' },
    cr_dump:    { id: '', name: '' },
    cr_fatigue: { id: '', name: '' },
    cr_roast:   { id: '', name: '' },
    cr_exploit: { id: '', name: '' },
    cr_reuse:   { id: '', name: '' },
    cr_sync:    { id: '', name: '' },
    cr_sniff:   { id: '', name: '' },
    cr_golden:  { id: '', name: '' },
    // MOVE
    mv_scan:     { id: '', name: '' },
    mv_shares:   { id: '', name: '' },
    mv_intphish: { id: '', name: '' },
    mv_remexp:   { id: '', name: '' },
    mv_desk:     { id: '', name: '' },
    mv_taint:    { id: '', name: '' },
    mv_mgmt:     { id: '', name: '' },
    mv_deploy:   { id: '', name: '' },
    mv_hijack:   { id: '', name: '' },
    mv_policy:   { id: '', name: '' },
    // EVADE
    ev_obf:    { id: '', name: '' },
    ev_run:    { id: '', name: '' },
    ev_web:    { id: '', name: '' },
    ev_task:   { id: '', name: '' },
    ev_inject: { id: '', name: '' },
    ev_lotl:   { id: '', name: '' },
    ev_wipe:   { id: '', name: '' },
    ev_mask:   { id: '', name: '' },
    ev_proxy:  { id: '', name: '' },
    ev_blind:  { id: '', name: '' },
    // IMPACT
    im_collect: { id: '', name: '' },
    im_payload: { id: '', name: '' },
    im_pack:    { id: '', name: '' },
    im_cloud:   { id: '', name: '' },
    im_shadow:  { id: '', name: '' },
    im_leak:    { id: '', name: '' },
    im_stop:    { id: '', name: '' },
    im_backup:  { id: '', name: '' },
    im_blitz:   { id: '', name: '' },
    im_safe:    { id: '', name: '' },
    im_auto:    { id: '', name: '' },
    im_hyper:   { id: '', name: '' },
    // CHAOS (Hacktivists)
    ch_deface:  { id: '', name: '' },
    ch_wiper:   { id: '', name: '' },
    ch_dump:    { id: '', name: '' },
    ch_swarm:   { id: '', name: '' },
    ch_boot:    { id: '', name: '' },
    ch_leak:    { id: '', name: '' },
    ch_zero:    { id: '', name: '' },
    ch_backup:  { id: '', name: '' },
    ch_bomb:    { id: '', name: '' },
    ch_brick:   { id: '', name: '' },
    ch_kill:    { id: '', name: '' },
    ch_scorch:  { id: '', name: '' },
    // COLLECT (APT)
    ap_collect: { id: '', name: '' },
    ap_stage:   { id: '', name: '' },
    ap_sleep:   { id: '', name: '' },
    ap_mail:    { id: '', name: '' },
    ap_hours:   { id: '', name: '' },
    ap_nest:    { id: '', name: '' },
    ap_tunnel:  { id: '', name: '' },
    ap_flag:    { id: '', name: '' },
    ap_bridge:  { id: '', name: '' },
    ap_ghost:   { id: '', name: '' },
    // COPYPASTA (Script Kiddies)
    sk_gpt:     { id: '', name: '' },
    sk_combo:   { id: '', name: '' },
    sk_video:   { id: '', name: '' },
    sk_rat:     { id: '', name: '' },
    sk_guide:   { id: '', name: '' },
    sk_paste:   { id: '', name: '' },
    sk_thread:  { id: '', name: '' },
    sk_docs:    { id: '', name: '' },
    // CLOUT (Script Kiddies)
    sk_chat:    { id: '', name: '' },
    sk_brag:    { id: '', name: '' },
    sk_beg:     { id: '', name: '' },
    sk_alt:     { id: '', name: '' },
    sk_vpn:     { id: '', name: '' },
    sk_pfp:     { id: '', name: '' },
    sk_mentor:  { id: '', name: '' },
    // YOLO (Script Kiddies)
    sk_spam:    { id: '', name: '' },
    sk_usb:     { id: '', name: '' },
    sk_admin:   { id: '', name: '' },
    sk_booter:  { id: '', name: '' },
    sk_energy:  { id: '', name: '' },
    sk_google:  { id: '', name: '' },
    sk_pray:    { id: '', name: '' }
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

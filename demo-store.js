// Shared demo state for Traverent Bandung POC (Landing Page, Admin Dashboard, Crew PWA)
// Persists orders, crew, fleet, rates, and transactions in localStorage on the same origin.
(function (global) {
  const STORE_KEY = 'traverent_demo_store_v1';
  const ADMIN_AUTH_KEY = 'traverent_admin_session';
  const CREW_AUTH_KEY = 'traverent_crew_session';

  const pad = n => String(n).padStart(2, '0');
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function dtISO(dayOffset, timeStr) {
    const d = new Date(today);
    d.setDate(d.getDate() + dayOffset);
    d.setHours(+timeStr.slice(0, 2), +timeStr.slice(3), 0, 0);
    return d.toISOString();
  }

  function defaultData() {
    const RATES = {
      'Honda New Beat': [[85000, 95000], [105000, 120000], [10000, 15000]],
      'Honda New Vario': [[105000, 115000], [130000, 145000], [15000, 20000]],
      'Yamaha New Gear': [[95000, 105000], [115000, 130000], [10000, 15000]]
    };

    const CREW = [
      { id: 'K1', n: 'Asep Saepudin', wa: '081234560001' },
      { id: 'K2', n: 'Dimas Prakoso', wa: '081234560002' },
      { id: 'K3', n: 'Rian Hidayat', wa: '081234560003' }
    ];

    const mk = (id, nama, kota, unit, sOff, sTime, eOff, eTime, st, crew, c, extra) => Object.assign({
      id,
      nama,
      kota,
      unit,
      s: dtISO(sOff, sTime),
      e: dtISO(eOff, eTime),
      st,
      crew,
      rcrew: null,
      c,
      wa: '0812345678' + id.slice(-2),
      email: nama.toLowerCase().replace(/\s+/g, '.') + '@gmail.com',
      ec: ['Keluarga ' + nama.split(' ')[0], '0812987654' + id.slice(-2)],
      ig: '@' + nama.toLowerCase().replace(/\s+/g, ''),
      tt: '',
      tujuan: 'Wisata keliling Bandung, mengunjungi Lembang dan Dago.',
      area: 'Lembang, Dago',
      alamat: 'Hotel Grand Asia, Jl. Braga No. 12, Bandung',
      lat: -6.9175,
      lng: 107.6191
    }, extra || {});

    const ORDERS = [
      mk('ORD-29102', 'Rizky Pratama', 'Jakarta', 'Honda New Beat', 3, '09:00', 6, '17:00', 'review', null, [0, '09:12'], { tt: '@rizky.pr', lat: -6.9178, lng: 107.6098 }),
      mk('ORD-29101', 'Siti Nurhaliza', 'Surabaya', 'Honda New Vario', 2, '08:00', 4, '18:00', 'review', null, [0, '08:40'], { tujuan: 'Liburan keluarga dan wisata kuliner.', area: 'Setiabudi, Cihampelas', alamat: 'Cihampelas Inn, Jl. Cihampelas No. 88, Bandung', lat: -6.8936, lng: 107.6050 }),
      mk('ORD-29098', 'Andre Wijaya', 'Medan', 'Yamaha New Gear', 1, '10:00', 3, '16:00', 'awaiting_dp', null, [0, '07:55'], { tt: '@andrew', alamat: 'Hotel Dago Suites, Jl. Ir. H. Juanda No. 45, Bandung', lat: -6.8847, lng: 107.6131 }),
      mk('ORD-29095', 'Dewi Lestari', 'Yogyakarta', 'Honda New Beat', 1, '09:00', 2, '19:00', 'dp_uploaded', null, [-1, '16:20'], { alamat: 'Hotel Pasteur Inn, Jl. Dr. Djundjunan No. 7, Bandung', lat: -6.8895, lng: 107.5953 }),
      mk('ORD-29090', 'Budi Santoso', 'Malang', 'Honda New Beat', 0, '13:00', 2, '13:00', 'notified', 'Dimas Prakoso', [-1, '11:05'], { alamat: 'Homestay Lembang Asri, Jl. Raya Lembang No. 101', lat: -6.8120, lng: 107.6178 }),
      mk('ORD-29087', 'Maya Putri', 'Semarang', 'Honda New Vario', 4, '09:00', 5, '17:00', 'assigned', 'Asep Saepudin', [-1, '09:30'], { tt: '@mayaputri', alamat: 'Apartemen Taman Sari, Jl. Taman Sari No. 20, Bandung', lat: -6.8940, lng: 107.6090 })
    ];

    ORDERS.forEach(o => {
      const upto = { review: 0, accepted: 1, awaiting_dp: 2, dp_uploaded: 3, assigned: 5, notified: 6 }[o.st] || 0;
      const txt = [
        'Pesanan diterima admin',
        'Link upload DP dikirim ke penyewa via WhatsApp',
        'Penyewa mengunggah bukti DP',
        'DP diverifikasi',
        'Ditugaskan ke ' + o.crew,
        'Notifikasi dikirim ke penyewa via WhatsApp'
      ];
      const parts = o.c[1].split(':').map(Number);
      const h = parts[0], m = parts[1];
      const at = k => {
        const t = h * 60 + m + 12 * (k + 1);
        return pad(Math.floor(t / 60) % 24) + ':' + pad(t % 60);
      };
      o.log = [{ t: o.c[1], x: 'Penyewa mengirim formulir pemesanan' }].concat(txt.slice(0, upto).map((x, k) => ({ t: at(k), x })));
      o.docs = [{ l: 'KTP', s: '', by: 'Penyewa' }, { l: 'SIM C', s: '', by: 'Penyewa' }];
      if (['dp_uploaded', 'assigned', 'notified'].includes(o.st)) o.docs.push({ l: 'Bukti DP', s: '', by: 'Penyewa' });
    });

    const FLEET = [
      { id: 'U1', n: 'Honda New Beat', plat: 'D 4521 ABX', y: '2022–2026', cc: 110, img: 'image/honda-new-beat-110cc.png' },
      { id: 'U2', n: 'Honda New Beat', plat: 'D 4522 ABX', y: '2022–2026', cc: 110, servis: true, img: 'image/honda-new-beat-110cc.png' },
      { id: 'U3', n: 'Honda New Vario', plat: 'D 5120 ACF', y: '2022–2026', cc: 125, img: 'image/honda-new-vario-125cc.png' },
      { id: 'U4', n: 'Yamaha New Gear', plat: 'D 3344 ADG', y: '2022–2026', cc: 125, order: 'ORD-29098', img: 'image/yamaha-new-gear-125cc.png' },
      { id: 'U5', n: 'Honda New Vario', plat: 'D 6677 AEH', y: '2022–2026', cc: 125, order: 'ORD-29095', img: 'image/honda-new-vario-125cc.png' },
      { id: 'U6', n: 'Honda New Beat', plat: 'D 7788 AFJ', y: '2022–2026', cc: 110, order: 'ORD-29090', img: 'image/honda-new-beat-110cc.png' },
      { id: 'U7', n: 'Yamaha New Gear', plat: 'D 8899 AGK', y: '2022–2026', cc: 125, order: 'ORD-29087', img: 'image/yamaha-new-gear-125cc.png' }
    ];

    const TRX = [
      { d: 0, id: 'ORD-29095', n: 'Dewi Lestari', k: 'DP', a: 100000, s: 'Menunggu verifikasi' },
      { d: -1, id: 'ORD-29090', n: 'Budi Santoso', k: 'DP', a: 100000, s: 'Diterima' },
      { d: -1, id: 'ORD-29087', n: 'Maya Putri', k: 'DP', a: 100000, s: 'Diterima' },
      { d: -2, id: 'ORD-29080', n: 'Hendra Kusuma', k: 'Pelunasan', a: 420000, s: 'Lunas' },
      { d: -4, id: 'ORD-29072', n: 'Rina Marlina', k: 'Pelunasan', a: 285000, s: 'Lunas' }
    ];

    const STATIC_TASKS = [
      { id: 'T3', tipe: 'Jemput', order: 'ORD-29080', nama: 'Hendra Kusuma', wa: '081234567880', unit: 'Honda New Vario', plat: 'D 5120 ACF', alamat: 'Hotel Pasteur Inn, Jl. Dr. Djundjunan No. 7, Bandung', lat: -6.8895, lng: 107.5953, at: dtISO(0, '17:00'), crew: 'Dimas Prakoso', sisa: 420000, done: false },
      { id: 'T5', tipe: 'Antar', order: 'ORD-29072', nama: 'Rina Marlina', wa: '081234567872', unit: 'Honda New Beat', plat: 'D 6677 AEH', alamat: 'Apartemen Taman Sari, Jl. Taman Sari No. 20, Bandung', lat: -6.8940, lng: 107.6090, at: dtISO(-1, '09:00'), crew: 'Dimas Prakoso', sisa: 0, done: true },
      { id: 'T7', tipe: 'Jemput', order: 'ORD-29095', nama: 'Dewi Lestari', wa: '081234567895', unit: 'Honda New Beat', plat: 'D 6677 AEH', alamat: 'Hotel Pasteur Inn, Jl. Dr. Djundjunan No. 7, Bandung', lat: -6.8895, lng: 107.5953, at: dtISO(1, '19:00'), crew: 'Rian Hidayat', sisa: 250000, done: false }
    ];

    return { RATES, CREW, ORDERS, FLEET, TRX, STATIC_TASKS, crewSeq: 3, unitSeq: 7, orderSeq: 29102 };
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.ORDERS) && Array.isArray(parsed.CREW)) return parsed;
      }
    } catch (_) {}
    const def = defaultData();
    save(def);
    return def;
  }

  function save(data) {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify(data));
    } catch (_) {}
  }

  function calcTotal(order, rates) {
    const unitRates = (rates && rates[order.unit]) || [[95000, 105000], [115000, 130000], [10000, 15000]];
    const wd = unitRates[0], we = unitRates[1], extra = unitRates[2] || [10000, 15000];
    const isWE = d => [0, 5, 6].includes(d.getDay());
    const rate = (d, i) => (isWE(d) ? we : wd)[i];
    const extraRate = d => (isWE(d) ? extra[1] : extra[0]);
    const s = new Date(order.s), e = new Date(order.e);
    const ms = e - s, days = Math.floor(ms / 864e5), r = Math.ceil((ms - days * 864e5) / 36e5);
    let sum = 0;
    for (let i = 0; i < days; i++) {
      const d = new Date(s); d.setDate(d.getDate() + i);
      sum += rate(d, 1);
    }
    if (r > 0) {
      const d = new Date(s); d.setDate(d.getDate() + days);
      sum += r <= 3 ? r * extraRate(d) : r <= 12 ? rate(d, 0) : rate(d, 1);
    }
    return sum;
  }

  function createOrder(payload) {
    const store = load();
    store.orderSeq = (store.orderSeq || 29102) + 1;
    const id = 'ORD-' + store.orderSeq;
    const now = new Date();
    const hm = pad(now.getHours()) + ':' + pad(now.getMinutes());
    const docs = [];
    if (payload.ktpDataUrl) docs.push({ l: 'KTP', s: payload.ktpDataUrl, by: 'Penyewa' });
    else docs.push({ l: 'KTP', s: '', by: 'Penyewa' });
    docs.push({ l: 'SIM C', s: '', by: 'Penyewa' });
    if (payload.proofDataUrl) docs.push({ l: 'Bukti DP', s: payload.proofDataUrl, by: 'Penyewa' });

    const order = {
      id,
      nama: payload.nama,
      kota: payload.area ? payload.area.split(',')[0].trim() : 'Luar Kota',
      unit: payload.unit,
      s: payload.s,
      e: payload.e,
      st: 'review',
      crew: null,
      rcrew: null,
      c: [0, hm],
      wa: payload.wa,
      email: payload.email,
      ec: [payload.ecName, payload.ecPhone],
      ig: payload.ig,
      tt: payload.tt || '',
      tujuan: payload.tujuan,
      area: payload.area,
      alamat: payload.alamat,
      lat: -6.9175,
      lng: 107.6191,
      log: [{ t: hm, x: 'Penyewa mengirim formulir pemesanan' }],
      docs
    };
    if (payload.proofDataUrl) {
      store.TRX.unshift({ d: 0, id, n: payload.nama, k: 'DP', a: payload.dpAmount || 50000, s: 'Menunggu verifikasi' });
    }
    store.ORDERS.unshift(order);
    save(store);
    return order;
  }

  function submitDP(orderId, dataUrl, dpAmount) {
    const store = load();
    const o = store.ORDERS.find(x => x.id === orderId);
    if (!o) return null;
    const now = new Date();
    const hm = pad(now.getHours()) + ':' + pad(now.getMinutes());
    o.st = 'dp_uploaded';
    o.docs = o.docs || [];
    o.docs.push({ l: 'Bukti DP', s: dataUrl || '', by: 'Penyewa' });
    o.log = o.log || [];
    o.log.push({ t: hm, x: 'Penyewa mengunggah bukti DP' });
    if (!store.TRX.some(t => t.id === o.id && t.k === 'DP')) {
      store.TRX.unshift({ d: 0, id: o.id, n: o.nama, k: 'DP', a: dpAmount || 100000, s: 'Menunggu verifikasi' });
    }
    save(store);
    return o;
  }

  function confirmReturnByCustomer(orderId) {
    const store = load();
    const o = store.ORDERS.find(x => x.id === orderId);
    if (!o) return null;
    const now = new Date();
    const hm = pad(now.getHours()) + ':' + pad(now.getMinutes());
    o.log = o.log || [];
    o.log.push({ t: hm, x: 'Penyewa mengonfirmasi pengembalian motor via link' });
    save(store);
    return o;
  }

  global.TraverentDemo = {
    STORE_KEY,
    ADMIN_AUTH_KEY,
    CREW_AUTH_KEY,
    load,
    save,
    calcTotal,
    createOrder,
    submitDP,
    confirmReturnByCustomer
  };
})(window);

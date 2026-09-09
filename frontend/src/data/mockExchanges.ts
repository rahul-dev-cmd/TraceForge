import { ExchangeRecord } from '../types/exchange';

export const mockExchanges: ExchangeRecord[] = [
  {
    id: 'EXCH-APEX-01',
    name: 'ApexGlobal Exchange (Offshore VASP)',
    jurisdiction: 'Seychelles / St. Vincent (Offshore)',
    vaspType: 'Centralized VASP',
    complianceStatus: 'Cooperative',
    depositAddress: '0x82A49e9841fE6C3886bC5A039439c2c62391991F',
    network: 'Ethereum',
    totalReceivedFiat: '$5,800,000',
    totalReceivedCrypto: '5,800,000 USDT',
    associatedCaseId: 'case-2026-0142',
    riskLevel: 'CRITICAL',
    simulatedKyc: {
      customerReference: 'APX-98412-SG (Simulated)',
      registrationDate: '2026-02-14 11:22 UTC',
      verificationTier: 'Tier 2 (Full Identity)',
      declaredCountry: 'Singapore (Simulated)',
      accountStatus: 'Temporarily Frozen Under MLAT',
      linkedDepositAddresses: [
        '0x82A49e9841fE6C3886bC5A039439c2c62391991F',
        '0x742d35Cc6634C0532925a3b844Bc454e4438f44e'
      ],
      withdrawalAddresses: [
        '0x91F729ab83Cde4982390483a9123019842F90812'
      ],
      lastLoginIp: '198.51.100.42',
      isSimulatedDemoData: true,
    },
    simulatedIpLogs: [
      {
        id: 'IP-01',
        ipAddress: '198.51.100.42',
        asn: 'AS13335 (Cloudflare WARP / Relay)',
        isp: 'Cloudflare Inc.',
        location: 'Frankfurt am Main, Germany',
        isVpnOrProxy: true,
        proxyService: 'Commercial VPN Proxy (Exit Node)',
        timestamp: '2026-08-16 08:25 UTC',
        associatedSession: 'SESS-APX-98412-AUTH',
        isSimulatedDemoData: true,
      },
      {
        id: 'IP-02',
        ipAddress: '203.0.113.88',
        asn: 'AS45102 (Alibaba Cloud SG)',
        isp: 'Alibaba Cloud Singapore',
        location: 'Jurong, Singapore',
        isVpnOrProxy: false,
        timestamp: '2026-08-16 08:35 UTC',
        associatedSession: 'SESS-APX-98412-WITHDRAWAL',
        isSimulatedDemoData: true,
      }
    ],
    geoLocation: {
      country: 'Seychelles',
      city: 'Victoria',
      latitude: -4.6191,
      longitude: 55.4513,
      indicatorType: 'Exchange Headquarters'
    }
  },
  {
    id: 'EXCH-OTC-HAWALA',
    name: 'Offshore P2P / Hawala Cashout Desk',
    jurisdiction: 'Unregulated / Dark OTC Corridor',
    vaspType: 'OTC Desk',
    complianceStatus: 'Non-responsive',
    depositAddress: '0x91F729ab83Cde4982390483a9123019842F90812',
    network: 'Ethereum',
    totalReceivedFiat: '$18,400,000',
    totalReceivedCrypto: '18,400,000 USDT',
    associatedCaseId: 'case-2026-0142',
    riskLevel: 'CRITICAL',
    simulatedKyc: {
      customerReference: 'OTC-TELEGRAM-DESK-88',
      registrationDate: '2025-09-01 14:00 UTC',
      verificationTier: 'Tier 1 (Basic)',
      declaredCountry: 'United Arab Emirates (Simulated)',
      accountStatus: 'Under Investigation',
      linkedDepositAddresses: ['0x91F729ab83Cde4982390483a9123019842F90812'],
      withdrawalAddresses: [],
      isSimulatedDemoData: true,
    },
    simulatedIpLogs: [
      {
        id: 'IP-03',
        ipAddress: '185.220.101.5',
        asn: 'AS208294 (Tor Exit Relay)',
        isp: 'Zwiebelfreunde Relay',
        location: 'Amsterdam, Netherlands',
        isVpnOrProxy: true,
        proxyService: 'Tor Onion Router',
        timestamp: '2026-08-16 14:15 UTC',
        associatedSession: 'SESS-OTC-HAWALA-EXEC',
        isSimulatedDemoData: true,
      }
    ],
    geoLocation: {
      country: 'United Arab Emirates',
      city: 'Dubai',
      latitude: 25.2048,
      longitude: 55.2708,
      indicatorType: 'Cash-out Node'
    }
  },
  {
    id: 'EXCH-THORCHAIN-ASGARD',
    name: 'THORChain Liquidity Protocol Vault',
    jurisdiction: 'Decentralized Cross-Chain Protocol (No Jurisdiction)',
    vaspType: 'Decentralized Liquidity Pool',
    complianceStatus: 'Unregulated / High Risk',
    depositAddress: 'bc1qthorchainvaultliquidity00000000000000000',
    network: 'Bitcoin',
    totalReceivedFiat: '$319,300,000',
    totalReceivedCrypto: '4,890.10 BTC',
    associatedCaseId: 'case-2026-0142',
    riskLevel: 'HIGH',
    geoLocation: {
      country: 'Global Distributed',
      city: 'Decentralized Validators',
      latitude: 51.5074,
      longitude: -0.1278,
      indicatorType: 'Suspected Entity Location'
    }
  },
  {
    id: 'EXCH-WASABI-COINJOIN',
    name: 'Wasabi 2.0 WabiSabi Mixing Coordinator',
    jurisdiction: 'Decentralized Privacy Pool (Tor Hidden Service)',
    vaspType: 'Privacy Mixer',
    complianceStatus: 'Sanctioned',
    depositAddress: 'bc1qmixerwasabipool9999988888777776666655555',
    network: 'Bitcoin',
    totalReceivedFiat: '$92,750,000',
    totalReceivedCrypto: '1,420.50 BTC',
    associatedCaseId: 'case-2026-0142',
    riskLevel: 'CRITICAL',
    geoLocation: {
      country: 'Tor Hidden Service',
      city: 'Anonymous Gateway',
      latitude: 52.5200,
      longitude: 13.4050,
      indicatorType: 'VPN Relay'
    }
  }
];

export const mockGeoThreatPoints = [
  {
    id: 'geo-1',
    title: 'Victim Infrastructure (Mumbai Healthcare Hospital)',
    location: 'Mumbai, India',
    latitude: 19.0760,
    longitude: 72.8777,
    type: 'Crime Scene / Victim Target',
    risk: 'LOW',
    details: 'Initial ransomware extortion demand executed on medical server systems.',
    caseId: 'case-2026-0142',
    amount: '₹20.4 Cr (320.5 BTC)'
  },
  {
    id: 'geo-2',
    title: 'VPN Exit Relay / TOR Ingress Telemetry',
    location: 'Frankfurt, Germany',
    latitude: 50.1109,
    longitude: 8.6821,
    type: 'VPN / Proxy Node',
    risk: 'HIGH',
    details: 'Simulated IP 198.51.100.42 used to submit transaction RPCs.',
    caseId: 'case-2026-0142',
    amount: 'N/A'
  },
  {
    id: 'geo-3',
    title: 'ApexGlobal Custodial VASP Headquarters',
    location: 'Victoria, Seychelles',
    latitude: -4.6191,
    longitude: 55.4513,
    type: 'Exchange VASP',
    risk: 'CRITICAL',
    details: 'Offshore exchange hosting deposit sub-account #98412 ($5.8M USDT frozen).',
    caseId: 'case-2026-0142',
    amount: '$5,800,000 USDT'
  },
  {
    id: 'geo-4',
    title: 'Offshore OTC Hawala Cash-out Broker Hub',
    location: 'Dubai, UAE',
    latitude: 25.2048,
    longitude: 55.2708,
    type: 'Cash-out Node',
    risk: 'CRITICAL',
    details: 'P2P dark liquidation desk converting USDT into local fiat bank wires.',
    caseId: 'case-2026-0142',
    amount: '$18,400,000 USDT'
  },
  {
    id: 'geo-5',
    title: 'Syndicate-88 Infrastructure Cluster (Suspected Host)',
    location: 'Bucharest, Romania',
    latitude: 44.4268,
    longitude: 26.1025,
    type: 'Suspected Entity Location',
    risk: 'CRITICAL',
    details: 'Threat actor command-and-control server beacon telemetry.',
    caseId: 'case-2026-0142',
    amount: 'Cluster #88'
  }
];

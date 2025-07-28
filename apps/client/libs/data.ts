import {
  Globe,
  FileText,
  BarChart3,
  ShieldCheck,
  LineChart,
  Settings,
  Users,
  LayoutDashboard,
  SearchCheck,
  BrainCircuit,
  FileSearch,
  SearchCode,
} from 'lucide-react';

export const plans = [
    {
      name: 'Starter',
      features: [
        ['Unlimited domains', true],
        ['1 content DinoBRAIN', true],
        ['DinoBRAIN web architecture', true],
        ['10 DinoBRAIN cures', true],
        ['Local SEO', false],
        ['400 keywords to track', true],
        ['Geolocalized Tracking', true],
        ['Real Search', true],
        ['25 Domain tracking', true],
        ['300 TF*IDF analysis', true],
        ['200 Keyword Research', true],
        ['100 Results by keyword research', true],
        ['20 Cannibalization & thin content tracking', true],
        ['External linking management', true],
        ['50 Graphical analysis visibility competition', true],
        ['50 Results by analysis of visibility', true],
        ['White Label Reports', true],
        ['Link Building', false],
        ['Content Gap', false],
      ],
    },
    {
      name: 'Pro',
      featured: true,
      features: [
        ['Unlimited domains', true],
        ['20 DinoBRAIN contents', true],
        ['5 DinoBRAIN web architectures', true],
        ['40 cures DinoBRAIN', true],
        ['30 Local SEO analysis', true],
        ['800 keywords to track', true],
        ['Geolocalized Tracking', true],
        ['Real Search', true],
        ['50 Domain tracking', true],
        ['600 TF*IDF analysis', true],
        ['600 Keyword Research', true],
        ['300 Results by keyword research', true],
        ['40 Tracking by cannibalization & thin content', true],
        ['External linking management', true],
        ['150 Graphical analysis visibility competition', true],
        ['100 Results by visibility analysis', true],
        ['White Label Reports', true],
        ['Link Building', true],
        ['Content Gap', true],
      ],
    },
    {
      name: 'Business',
      features: [
        ['Unlimited domains', true],
        ['80 DinoBRAIN contents', true],
        ['10 DinoBRAIN web architectures', true],
        ['90 cures DinoBRAIN', true],
        ['70 Local SEO analysis', true],
        ['2000 keywords to crawl', true],
        ['Geolocalized Tracking', true],
        ['Real Search', true],
        ['100 Domain tracking', true],
        ['1000 TF*IDF analysis', true],
        ['1200 Keyword Research', true],
        ['900 Results by keyword research', true],
        ['80 Cannibalization tracking & thin content', true],
        ['External linking management', true],
        ['300 Graphical analysis visibility competition', true],
        ['150 Results by analysis of visibility', true],
        ['White Label Reports', true],
        ['Link Building', true],
        ['Content Gap', true],
      ],
    },
  ];

export interface NavItem {
  name: string;
  href: string;
  icon: any;
  disabled?: boolean;
}

export const navItems = (activeProject: boolean): NavItem[] => [
  { name: 'New Analysis', href: '/', icon: Globe },
  { name: 'Reports', href: '/reports', icon: FileText },
  { name: 'Stats', href: '/stats', icon: BarChart3 },
  { name: 'Website Audit', href: '/audit', icon: SearchCheck, disabled: !activeProject },
  { name: 'Rankings', href: '/rankings', icon: LineChart, disabled: !activeProject },
  { name: 'Backlinks', href: '/backlinks', icon: ShieldCheck, disabled: !activeProject },
  { name: 'Website Health', href: '/health', icon: LayoutDashboard, disabled: !activeProject },
  { name: 'Competitors', href: '/competitors', icon: Users, disabled: !activeProject },
  { name: 'Project Settings', href: '/settings', icon: Settings, disabled: !activeProject },
];

export const seoNavItems = (): NavItem[] => [
  { name: 'SEO Analytics', href: '/features/analytics', icon: LayoutDashboard },
  { name: 'AI Optimization', href: '/features/ai', icon: BrainCircuit },
  { name: 'Content SEO', href: '/features/content', icon: FileSearch },
  { name: 'On-page SEO', href: '/features/onpage', icon: SearchCode },
  { name: 'Off-page SEO', href: '/features/offpage', icon: SearchCheck },
]


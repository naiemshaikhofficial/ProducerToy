import React from 'react'
import Link from 'next/link'
import { Metadata } from 'next'
import { ArrowLeft, ShieldCheck, FileText, Scale, ExternalLink } from 'lucide-react'

export const metadata: Metadata = {
  title: 'End User License Agreement (EULA) | Producer Toy Store',
  description: 'Official End User License Agreement (EULA), 100% Royalty-Free Commercial Usage, Toywards Terms, and Software Licensing for Producer Toy Store.',
}

export default function EulaPage() {
  return (
    <div className="min-h-screen bg-[#121212] text-white py-12 sm:py-16 px-4 sm:px-8 lg:px-12 selection:bg-[#FA742B]/30 font-sans">
      <div className="max-w-4xl mx-auto space-y-10">
        
        {/* ========================================================================= */}
        {/* TOP BAR & BACK NAVIGATION                                                 */}
        {/* ========================================================================= */}
        <div className="space-y-4 pb-6 border-b border-[#242424]">
          <Link
            href="/"
            prefetch={true}
            className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white uppercase tracking-wider transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Store</span>
          </Link>

          <div>
            <div className="inline-flex items-center gap-2 bg-[#2a170d] border border-[#542813] px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-sm mb-3">
              <Scale size={14} className="text-[#FA742B]" />
              <span className="text-zinc-200">Legal Agreement & Terms</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
              Producer Toy Store End User License Agreement (EULA)
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-2">
              Last updated: January 15, 2026 • Producer Toy Store (India Operations & Global Distribution)
            </p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* IMPORTANT NOTICE CALLOUT BOX                                              */}
        {/* ========================================================================= */}
        <div className="bg-[#181818] border border-[#2e2e2e] border-l-4 border-l-[#FA742B] rounded-2xl p-6 sm:p-8 space-y-4 shadow-xl">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-[#FA742B] flex-shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Important Notice & Policies Incorporation
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed font-normal">
            Please read this Agreement carefully. It is a legal document that explains your rights and obligations related to your use of the Producer Toy Store, software tools, virtual instruments, audio plugins, sample packs, DAW templates, sound presets, and Services, including any purchases you make through the Store. By accessing the Producer Toy Store, downloading or using the Software and Sound libraries, or otherwise indicating acceptance, you agree to be bound by the terms of this Agreement.
          </p>
          <div className="pt-2 text-xs sm:text-sm text-zinc-400 space-y-2">
            <p className="font-semibold text-zinc-200">
              By accepting this Agreement, you also agree to our incorporated policies:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <Link href="/privacy" className="flex items-center gap-1.5 text-zinc-300 hover:text-[#FA742B] transition-colors">
                <FileText size={14} className="text-[#FA742B]" />
                <span className="underline">Privacy Policy</span>
              </Link>
              <Link href="/terms" className="flex items-center gap-1.5 text-zinc-300 hover:text-[#FA742B] transition-colors">
                <FileText size={14} className="text-[#FA742B]" />
                <span className="underline">Terms of Service</span>
              </Link>
              <Link href="/licensing" className="flex items-center gap-1.5 text-zinc-300 hover:text-[#FA742B] transition-colors">
                <FileText size={14} className="text-[#FA742B]" />
                <span className="underline">100% Royalty-Free Sound Licensing</span>
              </Link>
              <Link href="/features/toywards" className="flex items-center gap-1.5 text-zinc-300 hover:text-[#FA742B] transition-colors">
                <FileText size={14} className="text-[#FA742B]" />
                <span className="underline">Toywards Rewards Program</span>
              </Link>
              <Link href="/purchase-policy" className="flex items-center gap-1.5 text-zinc-300 hover:text-[#FA742B] transition-colors">
                <FileText size={14} className="text-[#FA742B]" />
                <span className="underline">Purchase & Refund Policy</span>
              </Link>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-xl bg-[#121212] border border-[#262626] text-xs text-zinc-300 leading-relaxed font-mono">
            <strong>BINDING ARBITRATION NOTICE:</strong> THIS AGREEMENT CONTAINS A BINDING, INDIVIDUAL ARBITRATION AND CLASS-ACTION WAIVER PROVISION. IF YOU ACCEPT THIS AGREEMENT, YOU AND PRODUCER TOY AGREE TO RESOLVE DISPUTES IN BINDING, INDIVIDUAL ARBITRATION AND GIVE UP THE RIGHT TO GO TO COURT INDIVIDUALLY OR AS PART OF A CLASS ACTION (SEE SECTION 13).
          </div>
        </div>

        {/* ========================================================================= */}
        {/* EULA BODY SECTIONS                                                        */}
        {/* ========================================================================= */}
        <div className="space-y-12 text-sm text-zinc-300 leading-relaxed divide-y divide-[#222222]">
          
          {/* SECTION 1: LICENSE GRANT */}
          <section className="space-y-4 pt-8 first:pt-0">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              1. License Grant
            </h2>
            <div className="space-y-3 text-zinc-400">
              <h3 className="text-base font-bold text-zinc-200">1.1 Standard License to Software & Sounds</h3>
              <p>
                Producer Toy operates the Producer Toy Store and allows you to add Software (VST/AU plugins, standalone applications) and Sound Content (sample packs, one-shots, loops, synth preset soundbanks, DAW project templates) to your digital library, either by purchasing a license or by adding free items to your account (each time you add content, it is a &ldquo;Transaction&rdquo;).
              </p>
              <p>
                Producer Toy grants you a personal, non-exclusive, non-transferable, non-sublicensable, worldwide, perpetual commercial license to use the Software and Sound Content for your creative audio productions, commercial music tracks, film scores, broadcasts, and streaming releases (the &ldquo;License&rdquo;). The content is <strong>licensed, not sold</strong>, to you under this License. The License does not grant you any title or ownership in the underlying raw binary files or audio master recordings.
              </p>

              <h3 className="text-base font-bold text-zinc-200 pt-2">1.2 Developer & Vendor Specific Terms</h3>
              <p>
                Certain third-party products and sound developer collections on Producer Toy Store may be subject to additional or alternative license terms between you and the respective developer/brand (&ldquo;Software Specific Terms&rdquo;). In the event of any conflict, the provisions of this Agreement shall govern unless explicitly stated otherwise.
              </p>
            </div>
          </section>

          {/* SECTION 2: 100% ROYALTY-FREE COMMERCIAL RIGHTS & RESTRICTIONS */}
          <section className="space-y-4 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              2. Commercial Rights & Prohibited Uses
            </h2>
            <div className="space-y-3 text-zinc-400">
              <p>
                <strong className="text-zinc-200">What You Can Do:</strong> You may release commercial songs, albums, video game audio, and client productions incorporating the sounds and plugins without paying royalties, clearance fees, or per-stream mechanical licensing fees.
              </p>
              <p>
                <strong className="text-zinc-200">License Conditions & Restrictions:</strong> You may not do any of the following with respect to the Software or Sound libraries:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-zinc-400">
                <li>Resell, rent, lease, sub-license, host, distribute, or transfer raw audio files, presets, or software installers in isolation or via peer-to-peer/torrent networks.</li>
                <li>Use purchased sound files or presets to construct competitive sample libraries, sound kits, virtual instrument plugins, or AI training datasets.</li>
                <li>Reverse engineer, derive source code from, decompile, disassemble, or crack the proprietary binary codes, copy protection, or DSP algorithms of any plugin.</li>
                <li>Create or distribute keygens, crack patches, or unauthorized software tools to bypass license authorization.</li>
                <li>Share, rent, or transfer your Producer Toy account credentials to third parties.</li>
                <li>Use the platform or services in violation of applicable laws, copyrights, or export regulations.</li>
              </ul>
            </div>
          </section>

          {/* SECTION 3: UPDATES AND PATCHES */}
          <section className="space-y-4 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              3. Updates, Patches, & Cloud Delivery
            </h2>
            <p className="text-zinc-400">
              Producer Toy and its developer partners may provide updates, patches, bug fixes, or revised installers that must be installed in order for you to continue using the Software or Services. Digital content is served via high-speed CDN and accessible directly from your personal <Link href="/library" className="text-[#FA742B] underline">Product Library</Link>.
            </p>
          </section>

          {/* SECTION 4: USER GENERATED CONTENT & EXPANSIONS */}
          <section className="space-y-4 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              4. Expansions, Presets, & User Content
            </h2>
            <p className="text-zinc-400">
              Where the Services permit you to upload, submit, or make available custom synthesizer soundbanks, DAW templates, or creator expansions (&ldquo;Expansions&rdquo;), you represent and warrant that your content does not infringe upon any third-party intellectual property or copyright, does not contain malicious code, and complies with all applicable store guidelines.
            </p>
          </section>

          {/* SECTION 5: FEEDBACK */}
          <section className="space-y-4 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              5. Feedback
            </h2>
            <p className="text-zinc-400">
              If you provide Producer Toy with any suggestions, reviews, bug reports, or feedback regarding the Store or Services, you grant Producer Toy a non-exclusive, fully-paid, royalty-free, perpetual, transferable license to use and exploit that feedback to improve the platform without compensation obligations.
            </p>
          </section>

          {/* SECTION 6: INTELLECTUAL PROPERTY OWNERSHIP */}
          <section className="space-y-4 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              6. Ownership & Intellectual Property
            </h2>
            <p className="text-zinc-400">
              Producer Toy and its respective developer licensors own all title, copyright, intellectual property rights, and DSP source code in the Software and audio master samples. Producer Toy and the stylized toy logo are trademarks of Producer Toy. You retain 100% ownership of your original musical compositions and sound recordings created using these tools.
            </p>
          </section>

          {/* SECTION 7: DISCLAIMERS & LIMITATION OF LIABILITY */}
          <section className="space-y-4 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              7. Disclaimers and Limitation of Liability
            </h2>
            <p className="text-zinc-400">
              The Software and Services are provided on an &ldquo;AS IS&rdquo; and &ldquo;AS AVAILABLE&rdquo; basis without warranty of any kind. To the maximum extent permitted by applicable law, Producer Toy disclaims all warranties (express or implied), including non-infringement, merchantability, or fitness for a particular DAW or operating system environment.
            </p>
            <p className="text-zinc-400">
              In no event shall Producer Toy or its developer partners be liable for indirect, incidental, punitive, or consequential damages. Aggregate liability under this Agreement shall not exceed the total amounts actually paid by you to Producer Toy for the particular product in the twelve (12) months preceding the claim.
            </p>
          </section>

          {/* SECTION 8: INDEMNITY */}
          <section className="space-y-4 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              8. Indemnity
            </h2>
            <p className="text-zinc-400">
              You agree to indemnify, defend, and hold harmless Producer Toy, its affiliates, developer partners, directors, and employees from all claims, damages, liabilities, and legal expenses arising out of any breach of this EULA or unauthorized redistribution of licensed content.
            </p>
          </section>

          {/* SECTION 9: TERMINATION */}
          <section className="space-y-4 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              9. Termination
            </h2>
            <p className="text-zinc-400">
              This Agreement remains effective until terminated. Breach of any terms specified in this EULA will result in automatic termination of your license without prior notice, upon which all digital copies and derived standalone library assets must be permanently deleted.
            </p>
          </section>

          {/* SECTION 10: PURCHASES, PAYMENTS & TAXES */}
          <section className="space-y-4 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              10. Purchases, Payments, & Taxes
            </h2>
            <p className="text-zinc-400">
              Orders placed on Producer Toy Store are processed through secure payment gateways (including Razorpay for INR transactions and PayPal for international USD orders). Applicable Goods & Services Tax (GST 18%) and international VAT are clearly itemized before order confirmation.
            </p>
          </section>

          {/* SECTION 11: TOYWARDS REWARDS PROGRAM */}
          <section className="space-y-4 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              11. Toywards Rewards Loyalty Program
            </h2>
            <div className="space-y-3 text-zinc-400">
              <h3 className="text-base font-bold text-zinc-200">11.1 Program Description & Earning</h3>
              <p>
                All registered Producer Toy account holders are automatically enrolled in the <Link href="/features/toywards" className="text-[#FA742B] underline font-semibold">Toywards Loyalty Program</Link>. You earn from 5% to 20% back in Toywards on eligible store purchases. Toywards are credited to your active Rewards Balance to spend on future plugins and sound kits at checkout.
              </p>
              
              <h3 className="text-base font-bold text-zinc-200 pt-2">11.2 Redemption, Cap & Expiration</h3>
              <ul className="list-disc pl-5 space-y-1.5 text-zinc-400">
                <li>Toywards expire <strong>25 months</strong> from the date they are granted to your Rewards Balance.</li>
                <li>Your maximum Toywards balance is capped at <strong>USD $500</strong> (or local currency equivalent, e.g. INR).</li>
                <li>Toywards are applied at checkout on a <strong>first-in, first-out</strong> basis and can be combined with store promotions and creator discount coupons.</li>
                <li>Toywards have no cash value outside of Producer Toy Store and cannot be transferred, traded, or cashed out.</li>
                <li>If an order is refunded in accordance with our <Link href="/purchase-policy" className="text-[#FA742B] underline">Purchase Policy</Link>, any Toywards earned from that purchase will be deducted from your balance.</li>
              </ul>
            </div>
          </section>

          {/* SECTION 12: GOVERNING LAW & JURISDICTION */}
          <section className="space-y-4 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              12. Governing Law & Jurisdiction
            </h2>
            <p className="text-zinc-400">
              This Agreement shall be governed by and construed in accordance with the laws of India, without giving effect to any principles of conflicts of law. For international customers, disputes shall be settled in accordance with recognized international commercial dispute resolution frameworks.
            </p>
          </section>

          {/* SECTION 13: BINDING INDIVIDUAL ARBITRATION & CLASS ACTION WAIVER */}
          <section className="space-y-4 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              13. Binding Individual Arbitration & Class Action Waiver
            </h2>
            <div className="space-y-3 text-zinc-400">
              <p>
                <strong className="text-zinc-200">Informal Resolution:</strong> You and Producer Toy agree to attempt in good faith to resolve any dispute informally for at least thirty (30) days before initiating formal arbitration proceedings.
              </p>
              <p>
                <strong className="text-zinc-200">Binding Arbitration:</strong> Any unresolved dispute, controversy, or claim arising out of or relating to this Agreement or your use of the Store shall be resolved through binding individual arbitration administered by an established arbitration body.
              </p>
              <p>
                <strong className="text-zinc-200">Class Action Waiver:</strong> TO THE FULLEST EXTENT PERMITTED BY LAW, ALL CLAIMS AND DISPUTES MUST BE BROUGHT IN AN INDIVIDUAL CAPACITY AND NOT AS A PLAINTIFF OR CLASS MEMBER IN ANY PURPORTED CLASS, COLLECTIVE, OR REPRESENTATIVE PROCEEDING.
              </p>
            </div>
          </section>

          {/* SECTION 14: AMENDMENTS */}
          <section className="space-y-4 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              14. Amendments of this Agreement
            </h2>
            <p className="text-zinc-400">
              Producer Toy reserves the right to issue an amended Agreement at any time by posting the updated version on our website. Continued use of the Store and digital downloads after the effective date of an amended Agreement constitutes your binding acceptance of all revised terms.
            </p>
          </section>

          {/* SECTION 15: DEFINITIONS */}
          <section className="space-y-4 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              15. Definitions
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-zinc-400">
              <li><strong>&ldquo;Producer Toy&rdquo;:</strong> Producer Toy Store, operated as producertoy.com.</li>
              <li><strong>&ldquo;Developer / Vendor&rdquo;:</strong> Third-party audio software company, sound designer, or creator distributing content on the Store.</li>
              <li><strong>&ldquo;Software & Sounds&rdquo;:</strong> Digital audio plugins (VST3, AU, AAX, CLAP), virtual instruments, synthesizer soundbanks, sample packs, loops, MIDI files, and DAW project templates.</li>
              <li><strong>&ldquo;Toywards&rdquo;:</strong> Store loyalty reward credits earned on eligible purchases.</li>
            </ul>
          </section>

          {/* SECTION 16: CONTACT & CLEARANCE SUPPORT */}
          <section className="space-y-4 pt-8">
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              16. Licensing Inquiries & Legal Contact
            </h2>
            <p className="text-zinc-400">
              For enterprise licensing, synchronization clearances, or questions regarding this Agreement, contact our legal desk at{' '}
              <a href="mailto:support@producertoy.com" className="text-[#FA742B] font-semibold hover:underline">
                support@producertoy.com
              </a>{' '}
              or visit our <Link href="/contact" className="text-[#FA742B] underline">Contact Desk</Link>.
            </p>
          </section>

        </div>

      </div>
    </div>
  )
}

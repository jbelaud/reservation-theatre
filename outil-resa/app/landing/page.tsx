import Link from "next/link"
import { Check, X, Mail, Armchair, Users, Phone, ArrowRight, Star, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-rose-900">
            <Armchair className="h-6 w-6" />
            <span>Resavo</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <Link href="#fonctionnalites" className="hover:text-rose-900 transition-colors">Fonctionnalités</Link>
            <Link href="#tarif" className="hover:text-rose-900 transition-colors">Tarif</Link>
            <Link href="#contact" className="hover:text-rose-900 transition-colors">Contact</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="hidden sm:inline-flex text-rose-900 hover:text-rose-800 hover:bg-rose-50">
              <Link href="/login">Espace Asso</Link>
            </Button>
            <Button asChild className="bg-rose-900 hover:bg-rose-800 text-white shadow-lg shadow-rose-900/20">
              <Link href="#contact">Demander un accès</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative pt-20 pb-32 overflow-hidden bg-white">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-rose-100/50 via-slate-50/50 to-white"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-rose-100 text-rose-900 hover:bg-rose-100/80">
                ✨ Nouveau : Saison 2026 ouverte
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Gérez les réservations de votre spectacle <span className="text-rose-900">simplement</span>.
              </h1>
              <p className="text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                L&apos;outil de réservation conçu pour les troupes de théâtre et associations amateurs. 
                Gardez la main sur votre billetterie, encaissez sur place, libérez-vous du téléphone.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" asChild className="w-full sm:w-auto text-lg h-12 px-8 bg-rose-900 hover:bg-rose-800 shadow-xl shadow-rose-900/20">
                  <Link href="#contact">Découvrir pour mon association <ArrowRight className="ml-2 h-5 w-5" /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="w-full sm:w-auto text-lg h-12 px-8 border-slate-300 hover:bg-slate-50">
                  <Link href="#fonctionnalites">Voir comment ça marche</Link>
                </Button>
              </div>
              <div className="pt-8 flex items-center justify-center gap-8 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" /> Sans paiement en ligne
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" /> Sans commission
                </div>
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" /> Support humain
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* La Différenciation (3 NON) */}
        <section className="py-24 bg-slate-50 border-y border-slate-200">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Enfin une billetterie qui respecte votre fonctionnement</h2>
              <p className="text-lg text-slate-600">
                Nous avons créé Resavo parce que les outils de billetterie classiques sont trop complexes et prennent des commissions inutiles.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="border-none shadow-md bg-white">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
                    <X className="h-6 w-6 text-rose-900" />
                  </div>
                  <CardTitle>Pas de paiement en ligne</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Vos spectateurs réservent, vous encaissez à l&apos;entrée comme d&apos;habitude. Gardez votre trésorerie simple et directe.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md bg-white">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
                    <X className="h-6 w-6 text-rose-900" />
                  </div>
                  <CardTitle>Pas de commission cachée</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Un prix fixe annuel, quel que soit votre nombre de spectateurs. Zéro frais par billet vendu.
                  </p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-md bg-white">
                <CardHeader>
                  <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center mb-4">
                    <X className="h-6 w-6 text-rose-900" />
                  </div>
                  <CardTitle>Pas de complexité technique</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-600">
                    Pas besoin d&apos;être un expert informatique. L&apos;interface est pensée pour être utilisée par tous les bénévoles.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Problème / Solution */}
        <section className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-6">Avant Resavo...</h2>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3 text-slate-600">
                      <Phone className="h-6 w-6 text-slate-400 shrink-0" />
                      <span>&quot;Allô, il reste des places pour samedi ?&quot; (Le téléphone sonne tout le temps)</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-600">
                      <div className="h-6 w-6 flex items-center justify-center text-slate-400 shrink-0 font-serif italic">!</div>
                      <span>Les feuilles volantes raturées à la caisse et les erreurs de comptage.</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-600">
                      <div className="h-6 w-6 flex items-center justify-center text-slate-400 shrink-0">?</div>
                      <span>La peur du surbooking et de devoir refuser des gens à l&apos;entrée.</span>
                    </li>
                  </ul>
                </div>
                <div className="h-px bg-slate-100 w-full" />
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-6 text-rose-900">Avec Resavo !</h2>
                  <ul className="space-y-4">
                    <li className="flex items-start gap-3 text-slate-800 font-medium">
                      <Check className="h-6 w-6 text-green-600 shrink-0" />
                      <span>Vos spectateurs voient les places libres en temps réel.</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-800 font-medium">
                      <Check className="h-6 w-6 text-green-600 shrink-0" />
                      <span>Vous centralisez tout (web, téléphone, amis) au même endroit.</span>
                    </li>
                    <li className="flex items-start gap-3 text-slate-800 font-medium">
                      <Check className="h-6 w-6 text-green-600 shrink-0" />
                      <span>Vous imprimez une liste propre et lisible pour l&apos;accueil du public.</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="bg-slate-100 rounded-2xl p-8 aspect-square flex items-center justify-center relative shadow-inner">
                {/* Placeholder visuel */}
                <div className="absolute inset-0 bg-slate-200 rounded-2xl animate-pulse"></div>
                <div className="relative z-10 text-slate-400 font-medium">
                  Capture d&apos;écran Interface (Plan de Salle)
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Fonctionnalités Clés */}
        <section id="fonctionnalites" className="py-24 bg-slate-900 text-white">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold mb-4">Tout ce dont une troupe amateur a besoin</h2>
              <p className="text-slate-400 text-lg">
                Des outils simples mais puissants pour gérer votre saison sereinement.
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-rose-600 flex items-center justify-center">
                  <Armchair className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Plan de Salle Visuel</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Vos spectateurs choisissent leur fauteuil préféré en un clic sur un plan clair et coloré.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-rose-600 flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Guichet Unique</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Saisissez vous-même les réservations prises par téléphone ou par les membres de la troupe.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-rose-600 flex items-center justify-center">
                  <ShieldCheck className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Gestion PMR & Invitations</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Bloquez facilement des places pour les officiels ou les personnes à mobilité réduite.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-rose-600 flex items-center justify-center">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold">Zéro Commission</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Gardez 100% du prix de vos billets. Pas de frais bancaires, pas d&apos;intermédiaire.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Tarif */}
        <section id="tarif" className="py-24 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="max-w-lg mx-auto">
              <Card className="border-rose-100 shadow-xl bg-white overflow-hidden relative">
                <div className="absolute top-0 inset-x-0 h-2 bg-rose-900"></div>
                <CardHeader className="text-center pt-10 pb-2">
                  <CardTitle className="text-2xl text-slate-900">Licence Annuelle Association</CardTitle>
                  <CardDescription className="text-slate-500">Un tarif unique pour toute la saison</CardDescription>
                </CardHeader>
                <CardContent className="text-center space-y-8 pb-10">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-extrabold text-slate-900">299€</span>
                    <span className="text-slate-500">/an</span>
                  </div>
                  <ul className="space-y-3 text-left max-w-xs mx-auto">
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-rose-900 shrink-0" />
                      <span className="text-slate-700">Nombre de spectacles <span className="font-bold">illimité</span></span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-rose-900 shrink-0" />
                      <span className="text-slate-700">Nombre de spectateurs <span className="font-bold">illimité</span></span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-rose-900 shrink-0" />
                      <span className="text-slate-700">Support humain inclus</span>
                    </li>
                    <li className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-rose-900 shrink-0" />
                      <span className="text-slate-700">Pas de frais cachés</span>
                    </li>
                  </ul>
                  <Button size="lg" className="w-full bg-rose-900 hover:bg-rose-800" asChild>
                    <Link href="#contact">Demander mon accès</Link>
                  </Button>
                  <p className="text-xs text-slate-400">
                    Idéal pour les structures organisant 1 à 5 spectacles par an.<br/>
                    Pas de tacite reconduction piège.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Contact (The Human Gate) */}
        <section id="contact" className="py-24 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 mb-4">Prêt à simplifier votre prochaine saison ?</h2>
                <p className="text-lg text-slate-600">
                  L&apos;accès à Resavo se fait sur demande. Nous créons votre espace manuellement pour nous assurer qu&apos;il correspond parfaitement à votre salle.
                </p>
              </div>
              
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 text-left shadow-sm hover:shadow-md transition-shadow">
                <div className="h-20 w-20 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                  <Mail className="h-10 w-10 text-rose-900" />
                </div>
                <div className="flex-1 space-y-2 text-center md:text-left">
                  <h3 className="text-xl font-bold text-slate-900">Écrivez-nous</h3>
                  <p className="text-slate-600">
                    Envoyez-nous simplement le nom de votre association et vos dates de spectacle. On s&apos;occupe du reste.
                  </p>
                  <div className="pt-2">
                    <a 
                      href="mailto:ets.belaud@gmail.com?subject=Demande%20d'acc%C3%A8s%20Resavo" 
                      className="text-lg font-medium text-rose-900 hover:underline flex items-center justify-center md:justify-start gap-2"
                    >
                      ets.belaud@gmail.com <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                </div>
                <div className="hidden md:block">
                  <Button asChild size="lg" className="bg-white text-rose-900 border-2 border-rose-900 hover:bg-rose-50">
                    <a href="mailto:ets.belaud@gmail.com?subject=Demande%20d'acc%C3%A8s%20Resavo">
                      M&apos;envoyer un email
                    </a>
                  </Button>
                </div>
              </div>
              
              <p className="text-sm text-slate-400 italic">
                Réponse sous 24h, promis.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Rapide */}
        <section className="py-16 bg-slate-50 border-t border-slate-200">
          <div className="container mx-auto px-4 max-w-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Questions fréquentes</h2>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>Est-ce que je peux essayer avant de payer ?</AccordionTrigger>
                <AccordionContent>
                  Oui, nous pouvons vous ouvrir un accès de démonstration pour que vous puissiez tester l&apos;interface de gestion et voir si cela correspond à vos besoins.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>Comment mes spectateurs paient-ils ?</AccordionTrigger>
                <AccordionContent>
                  Resavo gère uniquement la réservation (le blocage du siège). Vos spectateurs paient leurs places le jour du spectacle, directement à votre guichet, selon vos modes de paiement habituels (espèces, chèque, CB...).
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>Et si je dois annuler une réservation ?</AccordionTrigger>
                <AccordionContent>
                  En tant qu&apos;administrateur, vous avez la main totale sur le plan de salle. Vous pouvez annuler, déplacer ou modifier n&apos;importe quelle réservation en quelques clics.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </main>

      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="container mx-auto px-4 grid md:grid-cols-3 gap-8 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 font-bold text-xl text-white mb-4">
              <Armchair className="h-6 w-6" />
              <span>Resavo</span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs mx-auto md:mx-0">
              La solution de réservation simple et humaine pour les associations de spectacle vivant.
            </p>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Liens utiles</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="#fonctionnalites" className="hover:text-rose-400">Fonctionnalités</Link></li>
              <li><Link href="#tarif" className="hover:text-rose-400">Tarifs</Link></li>
              <li><Link href="/login" className="hover:text-rose-400">Espace Association</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-white mb-4">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>ets.belaud@gmail.com</li>
              <li>France</li>
            </ul>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-12 pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Resavo. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}

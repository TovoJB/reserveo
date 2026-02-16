"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Phone, MessageCircle, HelpCircle, BookOpen, ExternalLink, MessagesSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export function SupportView() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Support & Aide</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessagesSquare className="h-5 w-5" />
                            Contactez-nous
                        </CardTitle>
                        <CardDescription>
                            Besoin d'une assistance immédiate ?
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-4">
                        <div className="flex items-center space-x-4">
                            <Mail className="h-4 w-4 opacity-70" />
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">Email</p>
                                <p className="text-sm text-muted-foreground">support@madaevent.com</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <Phone className="h-4 w-4 opacity-70" />
                            <div className="flex-1 space-y-1">
                                <p className="text-sm font-medium leading-none">Téléphone</p>
                                <p className="text-sm text-muted-foreground">+261 34 00 000 00</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Documentation & Guides
                        </CardTitle>
                        <CardDescription>
                            Ressources pour vous aider à utiliser la plateforme.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Accordion type="single" collapsible className="w-full">
                            <AccordionItem value="item-1">
                                <AccordionTrigger>Comment créer un nouvel événement ?</AccordionTrigger>
                                <AccordionContent>
                                    Dans la barre latérale gauche, cliquez sur le bouton "+" dans la section "Workgroups". Sélectionnez "Dossier", donnez-lui un nom (ex: Mariage) et choisissez l'emplacement parent.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-2">
                                <AccordionTrigger>Gérer les plans de salle</AccordionTrigger>
                                <AccordionContent>
                                    Une fois votre dossier créé, cliquez à nouveau sur "+" et choisissez "Plan Excalidraw". Sélectionnez le dossier parent que vous venez de créer. Vous pouvez ensuite cliquer sur le plan dans la liste pour l'ouvrir.
                                </AccordionContent>
                            </AccordionItem>
                            <AccordionItem value="item-3">
                                <AccordionTrigger>Intégration sur mon site</AccordionTrigger>
                                <AccordionContent>
                                    Rendez-vous dans la section "Développement" via le menu. Vous y trouverez vos clés API et les codes d'intégration (Iframe ou Script) à copier-coller sur votre site.
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-1">
                <Card>
                    <CardHeader>
                        <CardTitle>À propos de la plateforme</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        <p>
                            MadaEvent Admin v1.0.0
                        </p>
                        <p className="mt-2">
                            Cette plateforme est conçue pour simplifier la gestion de vos événements, réservations et plans de salle.
                            Pour toute suggestion ou rapport de bug, n'hésitez pas à contacter le support.
                        </p>
                        <div className="mt-4 flex gap-2">
                            <Button variant="outline" size="sm" asChild>
                                <Link href="https://madaevent.com/terms" target="_blank">Conditions d'utilisation</Link>
                            </Button>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="https://madaevent.com/privacy" target="_blank">Politique de confidentialité</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

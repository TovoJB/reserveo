"use client";

import { useEffect, useState } from "react";
import { Copy, RefreshCw, Code, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";

export function DevelopmentView() {
    const [apiKey, setApiKey] = useState("");
    const [isCopied, setIsCopied] = useState(false);
    const [scriptCopied, setScriptCopied] = useState(false);

    useEffect(() => {
        // Simulate fetching existing API key
        setApiKey("pk_live_51MadaEvent" + Math.random().toString(36).substring(7));
    }, []);

    const generateNewKey = () => {
        // Logic to generate new key would go here
        const newKey = "pk_live_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        setApiKey(newKey);
    };

    const copyToClipboard = (text: string, setCopied: (val: boolean) => void) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const iframeCode = `<iframe 
  src="https://book.madaevent.com/embed/${apiKey}" 
  width="100%" 
  height="600px" 
  frameborder="0"
></iframe>`;

    const scriptCode = `<script src="https://js.madaevent.com/v1/embed.js"></script>
<div id="booking-widget" data-key="${apiKey}"></div>`;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Développement</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Clés API</CardTitle>
                        <CardDescription>
                            Gérez vos clés API pour intégrer MadaEvent à vos applications.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="api-key">Clé Publique</Label>
                            <div className="flex space-x-2">
                                <Input id="api-key" value={apiKey} readOnly className="font-mono text-sm" />
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => copyToClipboard(apiKey, setIsCopied)}
                                >
                                    {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                                </Button>
                                <Button variant="outline" size="icon" onClick={generateNewKey}>
                                    <RefreshCw className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Utilisez cette clé pour authentifier vos requêtes côté client.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle>Intégration Web</CardTitle>
                        <CardDescription>
                            Intégrez le module de réservation directement sur votre site web.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="iframe" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="iframe">Iframe</TabsTrigger>
                                <TabsTrigger value="script">Script JS</TabsTrigger>
                            </TabsList>
                            <TabsContent value="iframe" className="space-y-4">
                                <div className="rounded-md bg-muted p-4">
                                    <pre className="text-xs overflow-x-auto whitespace-pre-wrap breaks-all">
                                        <code>{iframeCode}</code>
                                    </pre>
                                </div>
                                <Button
                                    className="w-full"
                                    variant="secondary"
                                    onClick={() => copyToClipboard(iframeCode, setScriptCopied)}
                                >
                                    {scriptCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                                    Copier le code
                                </Button>
                            </TabsContent>
                            <TabsContent value="script" className="space-y-4">
                                <div className="rounded-md bg-muted p-4">
                                    <pre className="text-xs overflow-x-auto whitespace-pre-wrap breaks-all">
                                        <code>{scriptCode}</code>
                                    </pre>
                                </div>
                                <Button
                                    className="w-full"
                                    variant="secondary"
                                    onClick={() => copyToClipboard(scriptCode, setScriptCopied)}
                                >
                                    {scriptCopied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
                                    Copier le code
                                </Button>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

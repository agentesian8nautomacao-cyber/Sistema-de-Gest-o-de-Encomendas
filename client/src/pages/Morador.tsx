import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Clock, CheckCircle2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function MoradorPage() {
  const { data: morador } = trpc.moradores.getByUser.useQuery();
  const { data: encomendas, isLoading } = trpc.encomendas.listByMorador.useQuery(
    { moradorId: morador?.id || 0 },
    { enabled: !!morador }
  );

  const pendentes = encomendas?.filter((e) => e.status === "pendente") || [];
  const retiradas = encomendas?.filter((e) => e.status === "retirada") || [];

  const getTipoLabel = (tipo: string) => {
    const labels: Record<string, string> = {
      carta: "Carta",
      pacote: "Pacote",
      delivery: "Delivery",
    };
    return labels[tipo] || tipo;
  };

  const getTipoBadgeVariant = (tipo: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      carta: "secondary",
      pacote: "default",
      delivery: "outline",
    };
    return variants[tipo] || "default";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Minhas Encomendas</h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe suas encomendas e histórico de retiradas
        </p>
      </div>

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{pendentes.length}</div>
            <p className="text-xs text-muted-foreground">Aguardando retirada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retiradas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{retiradas.length}</div>
            <p className="text-xs text-muted-foreground">Total de encomendas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Apartamento</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{morador?.apartamento || "-"}</div>
            <p className="text-xs text-muted-foreground">{morador?.nome}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Encomendas */}
      <Tabs defaultValue="pendentes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="pendentes">
            Pendentes ({pendentes.length})
          </TabsTrigger>
          <TabsTrigger value="historico">
            Histórico ({retiradas.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes" className="mt-6">
          {pendentes.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {pendentes.map((encomenda) => (
                <Card key={encomenda.id} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">
                          {getTipoLabel(encomenda.tipo)}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(encomenda.dataHoraRegistro), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </CardDescription>
                      </div>
                      <Badge variant={getTipoBadgeVariant(encomenda.tipo)}>
                        {getTipoLabel(encomenda.tipo)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {encomenda.fotoUrl && (
                      <img
                        src={encomenda.fotoUrl}
                        alt="Foto da encomenda"
                        className="w-full h-48 object-cover rounded-md border"
                      />
                    )}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Apartamento:</span>
                        <span className="font-medium">{encomenda.apartamento}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Registrado por:</span>
                        <span className="font-medium">
                          {encomenda.porteiroRegistroNome || "Portaria"}
                        </span>
                      </div>
                      {encomenda.observacoes && (
                        <div className="pt-2 border-t">
                          <p className="text-muted-foreground text-xs">Observações:</p>
                          <p className="text-sm italic">{encomenda.observacoes}</p>
                        </div>
                      )}
                    </div>
                    <Badge variant="outline" className="w-full justify-center py-2">
                      <Clock className="h-3 w-3 mr-1" />
                      Aguardando retirada
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Package className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  Nenhuma encomenda pendente
                </p>
                <p className="text-sm text-muted-foreground">
                  Você será notificado quando uma nova encomenda chegar
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="historico" className="mt-6">
          {retiradas.length > 0 ? (
            <div className="space-y-3">
              {retiradas.map((encomenda) => (
                <Card key={encomenda.id} className="hover:bg-accent/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <p className="font-medium">{getTipoLabel(encomenda.tipo)}</p>
                          <Badge variant={getTipoBadgeVariant(encomenda.tipo)} className="text-xs">
                            {getTipoLabel(encomenda.tipo)}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Registrado em{" "}
                          {format(new Date(encomenda.dataHoraRegistro), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </p>
                        {encomenda.observacoes && (
                          <p className="text-sm text-muted-foreground italic">
                            {encomenda.observacoes}
                          </p>
                        )}
                      </div>
                      {encomenda.fotoUrl && (
                        <img
                          src={encomenda.fotoUrl}
                          alt="Foto"
                          className="w-20 h-20 object-cover rounded border"
                        />
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Calendar className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  Nenhuma encomenda no histórico
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

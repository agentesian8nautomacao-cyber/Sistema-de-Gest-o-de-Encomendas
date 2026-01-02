import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, BellOff, Check, CheckCheck } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

export default function NotificacoesPage() {
  const utils = trpc.useUtils();
  const { data: notificacoes, isLoading } = trpc.notificacoes.list.useQuery();

  const marcarComoLida = trpc.notificacoes.marcarComoLida.useMutation({
    onSuccess: () => {
      utils.notificacoes.list.invalidate();
      utils.notificacoes.listNaoLidas.invalidate();
    },
  });

  const marcarTodasComoLidas = trpc.notificacoes.marcarTodasComoLidas.useMutation({
    onSuccess: () => {
      toast.success("Todas as notificações foram marcadas como lidas");
      utils.notificacoes.list.invalidate();
      utils.notificacoes.listNaoLidas.invalidate();
    },
  });

  const naoLidas = notificacoes?.filter((n) => !n.lida) || [];
  const lidas = notificacoes?.filter((n) => n.lida) || [];

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case "nova_encomenda":
        return "📦";
      case "encomenda_retirada":
        return "✅";
      case "sistema":
        return "ℹ️";
      default:
        return "🔔";
    }
  };

  const getTipoBadgeVariant = (tipo: string) => {
    const variants: Record<string, "default" | "secondary" | "outline"> = {
      nova_encomenda: "default",
      encomenda_retirada: "secondary",
      sistema: "outline",
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notificações</h1>
          <p className="text-muted-foreground mt-2">
            {naoLidas.length > 0
              ? `Você tem ${naoLidas.length} notificação(ões) não lida(s)`
              : "Todas as notificações foram lidas"}
          </p>
        </div>
        {naoLidas.length > 0 && (
          <Button
            variant="outline"
            onClick={() => marcarTodasComoLidas.mutate()}
            disabled={marcarTodasComoLidas.isPending}
          >
            <CheckCheck className="h-4 w-4 mr-2" />
            Marcar todas como lidas
          </Button>
        )}
      </div>

      {/* Resumo */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não Lidas</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{naoLidas.length}</div>
            <p className="text-xs text-muted-foreground">Requerem atenção</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <BellOff className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notificacoes?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Todas as notificações</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Notificações */}
      <div className="space-y-6">
        {naoLidas.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Não Lidas</h2>
            {naoLidas.map((notificacao) => (
              <Card
                key={notificacao.id}
                className="shadow-md hover:shadow-lg transition-shadow border-l-4 border-l-primary"
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{getTipoIcon(notificacao.tipo)}</span>
                        <div className="flex-1">
                          <h3 className="font-semibold text-foreground">{notificacao.titulo}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notificacao.mensagem}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant={getTipoBadgeVariant(notificacao.tipo)} className="text-xs">
                          {notificacao.tipo.replace("_", " ")}
                        </Badge>
                        <span>•</span>
                        <span>
                          {format(new Date(notificacao.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => marcarComoLida.mutate({ id: notificacao.id })}
                      disabled={marcarComoLida.isPending}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {lidas.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-foreground">Lidas</h2>
            {lidas.map((notificacao) => (
              <Card key={notificacao.id} className="opacity-60 hover:opacity-100 transition-opacity">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <span className="text-2xl">{getTipoIcon(notificacao.tipo)}</span>
                    <div className="flex-1 space-y-2">
                      <div>
                        <h3 className="font-semibold text-foreground">{notificacao.titulo}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{notificacao.mensagem}</p>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Badge variant={getTipoBadgeVariant(notificacao.tipo)} className="text-xs">
                          {notificacao.tipo.replace("_", " ")}
                        </Badge>
                        <span>•</span>
                        <span>
                          {format(new Date(notificacao.createdAt), "dd/MM/yyyy 'às' HH:mm", {
                            locale: ptBR,
                          })}
                        </span>
                        {notificacao.dataHoraLeitura && (
                          <>
                            <span>•</span>
                            <span>
                              Lida em{" "}
                              {format(new Date(notificacao.dataHoraLeitura), "dd/MM 'às' HH:mm", {
                                locale: ptBR,
                              })}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {(!notificacoes || notificacoes.length === 0) && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <Bell className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                Nenhuma notificação ainda
              </p>
              <p className="text-sm text-muted-foreground">
                Você será notificado sobre novas encomendas e atualizações
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

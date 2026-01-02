import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Package, Camera, X, CheckCircle2, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function PorteiroPage() {
  const utils = trpc.useUtils();
  const [selectedMoradorId, setSelectedMoradorId] = useState<string>("");
  const [apartamento, setApartamento] = useState("");
  const [tipo, setTipo] = useState<"carta" | "pacote" | "delivery">("pacote");
  const [observacoes, setObservacoes] = useState("");
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);
  const [fotoBase64, setFotoBase64] = useState<string | null>(null);
  const [fotoMimeType, setFotoMimeType] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [retiradaDialog, setRetiradaDialog] = useState(false);
  const [selectedEncomenda, setSelectedEncomenda] = useState<number | null>(null);
  const [nomeQuemRetirou, setNomeQuemRetirou] = useState("");
  const [observacoesRetirada, setObservacoesRetirada] = useState("");

  const { data: moradores, isLoading: loadingMoradores } = trpc.moradores.list.useQuery();
  const { data: encomendas, isLoading: loadingEncomendas } = trpc.encomendas.listPendentes.useQuery();

  const createEncomenda = trpc.encomendas.create.useMutation({
    onSuccess: () => {
      toast.success("Encomenda registrada com sucesso!");
      utils.encomendas.listPendentes.invalidate();
      resetForm();
    },
    onError: (error) => {
      toast.error(`Erro ao registrar encomenda: ${error.message}`);
    },
  });

  const registrarRetirada = trpc.encomendas.registrarRetirada.useMutation({
    onSuccess: () => {
      toast.success("Retirada registrada com sucesso!");
      utils.encomendas.listPendentes.invalidate();
      setRetiradaDialog(false);
      setSelectedEncomenda(null);
      setNomeQuemRetirou("");
      setObservacoesRetirada("");
    },
    onError: (error) => {
      toast.error(`Erro ao registrar retirada: ${error.message}`);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Arquivo muito grande. Máximo 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setFotoPreview(result);
      const base64 = result.split(",")[1];
      setFotoBase64(base64 || null);
      setFotoMimeType(file.type);
    };
    reader.readAsDataURL(file);
  };

  const removeFoto = () => {
    setFotoPreview(null);
    setFotoBase64(null);
    setFotoMimeType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resetForm = () => {
    setSelectedMoradorId("");
    setApartamento("");
    setTipo("pacote");
    setObservacoes("");
    removeFoto();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedMoradorId || !apartamento) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createEncomenda.mutate({
      moradorId: parseInt(selectedMoradorId),
      apartamento,
      tipo,
      observacoes: observacoes || undefined,
      fotoBase64: fotoBase64 || undefined,
      fotoMimeType: fotoMimeType || undefined,
    });
  };

  const handleRegistrarRetirada = () => {
    if (!selectedEncomenda || !nomeQuemRetirou) {
      toast.error("Preencha o nome de quem retirou");
      return;
    }

    registrarRetirada.mutate({
      encomendaId: selectedEncomenda,
      nomeQuemRetirou,
      observacoes: observacoesRetirada || undefined,
    });
  };

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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Gestão de Encomendas</h1>
        <p className="text-muted-foreground mt-2">Registre novas encomendas e gerencie retiradas</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Formulário de Registro */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Registrar Nova Encomenda
            </CardTitle>
            <CardDescription>Preencha os dados da encomenda recebida</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="morador">Morador *</Label>
                <Select value={selectedMoradorId} onValueChange={setSelectedMoradorId}>
                  <SelectTrigger id="morador">
                    <SelectValue placeholder="Selecione o morador" />
                  </SelectTrigger>
                  <SelectContent>
                    {loadingMoradores ? (
                      <SelectItem value="loading">Carregando...</SelectItem>
                    ) : (
                      moradores?.map((morador) => (
                        <SelectItem key={morador.id} value={morador.id.toString()}>
                          {morador.nome} - Apto {morador.apartamento}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="apartamento">Apartamento *</Label>
                <Input
                  id="apartamento"
                  value={apartamento}
                  onChange={(e) => setApartamento(e.target.value)}
                  placeholder="Ex: 101, 202A"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo">Tipo de Encomenda *</Label>
                <Select value={tipo} onValueChange={(v) => setTipo(v as typeof tipo)}>
                  <SelectTrigger id="tipo">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="carta">Carta</SelectItem>
                    <SelectItem value="pacote">Pacote</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Informações adicionais (opcional)"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Foto da Encomenda (opcional)</Label>
                {fotoPreview ? (
                  <div className="relative">
                    <img
                      src={fotoPreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-md border"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2"
                      onClick={removeFoto}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                      id="foto-input"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      Adicionar Foto
                    </Button>
                  </div>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={createEncomenda.isPending}>
                {createEncomenda.isPending ? "Registrando..." : "Registrar Encomenda"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Lista de Encomendas Pendentes */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Encomendas Pendentes
            </CardTitle>
            <CardDescription>
              {encomendas?.length || 0} encomenda(s) aguardando retirada
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingEncomendas ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : encomendas && encomendas.length > 0 ? (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {encomendas.map((encomenda) => (
                  <div
                    key={encomenda.id}
                    className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground">Apto {encomenda.apartamento}</p>
                          <Badge variant={getTipoBadgeVariant(encomenda.tipo)}>
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
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedEncomenda(encomenda.id);
                          setRetiradaDialog(true);
                        }}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        Retirar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Nenhuma encomenda pendente</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog de Retirada */}
      <Dialog open={retiradaDialog} onOpenChange={setRetiradaDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Retirada</DialogTitle>
            <DialogDescription>
              Informe quem está retirando a encomenda
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="nome-retirada">Nome de quem retirou *</Label>
              <Input
                id="nome-retirada"
                value={nomeQuemRetirou}
                onChange={(e) => setNomeQuemRetirou(e.target.value)}
                placeholder="Nome completo"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="obs-retirada">Observações</Label>
              <Textarea
                id="obs-retirada"
                value={observacoesRetirada}
                onChange={(e) => setObservacoesRetirada(e.target.value)}
                placeholder="Informações adicionais (opcional)"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRetiradaDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRegistrarRetirada} disabled={registrarRetirada.isPending}>
              {registrarRetirada.isPending ? "Registrando..." : "Confirmar Retirada"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

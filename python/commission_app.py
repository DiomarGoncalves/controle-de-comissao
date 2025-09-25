import tkinter as tk
from tkinter import ttk, messagebox, filedialog
import json
import csv
from datetime import datetime
import os

class CommissionApp:
    def __init__(self, root):
        self.root = root
        self.root.title("Sistema de Controle de Comissões")
        self.root.geometry("1200x700")
        
        # Arquivo para armazenar os dados
        self.data_file = "commissions_data.json"
        self.commissions = self.load_data()
        
        self.setup_ui()
        self.refresh_table()
    
    def setup_ui(self):
        # Frame principal
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # Configurar grid
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        main_frame.rowconfigure(2, weight=1)
        
        # Título
        title_label = ttk.Label(main_frame, text="Sistema de Controle de Comissões", 
                               font=("Arial", 16, "bold"))
        title_label.grid(row=0, column=0, columnspan=3, pady=(0, 20))
        
        # Frame do formulário
        form_frame = ttk.LabelFrame(main_frame, text="Cadastro de Comissão", padding="10")
        form_frame.grid(row=1, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=(0, 10))
        form_frame.columnconfigure(1, weight=1)
        form_frame.columnconfigure(3, weight=1)
        form_frame.columnconfigure(5, weight=1)
        
        # Campos do formulário
        ttk.Label(form_frame, text="N° NF:").grid(row=0, column=0, sticky=tk.W, padx=(0, 5))
        self.nf_var = tk.StringVar()
        ttk.Entry(form_frame, textvariable=self.nf_var, width=15).grid(row=0, column=1, sticky=(tk.W, tk.E), padx=(0, 10))
        
        ttk.Label(form_frame, text="N° Pedido Nectar:").grid(row=0, column=2, sticky=tk.W, padx=(0, 5))
        self.nectar_var = tk.StringVar()
        ttk.Entry(form_frame, textvariable=self.nectar_var, width=15).grid(row=0, column=3, sticky=(tk.W, tk.E), padx=(0, 10))
        
        ttk.Label(form_frame, text="N° Pedido Embrascol:").grid(row=0, column=4, sticky=tk.W, padx=(0, 5))
        self.embrascol_var = tk.StringVar()
        ttk.Entry(form_frame, textvariable=self.embrascol_var, width=15).grid(row=0, column=5, sticky=(tk.W, tk.E))
        
        ttk.Label(form_frame, text="Valor NF*:").grid(row=1, column=0, sticky=tk.W, padx=(0, 5), pady=(10, 0))
        self.valor_nf_var = tk.StringVar()
        ttk.Entry(form_frame, textvariable=self.valor_nf_var, width=15).grid(row=1, column=1, sticky=(tk.W, tk.E), padx=(0, 10), pady=(10, 0))
        
        ttk.Label(form_frame, text="Fator Multiplicador:").grid(row=1, column=2, sticky=tk.W, padx=(0, 5), pady=(10, 0))
        self.fator_var = tk.StringVar(value="0.025")
        ttk.Entry(form_frame, textvariable=self.fator_var, width=15).grid(row=1, column=3, sticky=(tk.W, tk.E), padx=(0, 10), pady=(10, 0))
        
        # Botão Salvar
        ttk.Button(form_frame, text="Salvar", command=self.save_commission).grid(row=1, column=4, columnspan=2, pady=(10, 0), sticky=tk.E)
        
        # Frame da tabela
        table_frame = ttk.LabelFrame(main_frame, text="Lista de Comissões", padding="10")
        table_frame.grid(row=2, column=0, columnspan=3, sticky=(tk.W, tk.E, tk.N, tk.S), pady=(0, 10))
        table_frame.columnconfigure(0, weight=1)
        table_frame.rowconfigure(0, weight=1)
        
        # Treeview para a tabela
        columns = ("ID", "N° NF", "Pedido Nectar", "Pedido Embrascol", "Valor NF", "Fator", "Valor Comissão", "Status", "Data")
        self.tree = ttk.Treeview(table_frame, columns=columns, show="headings", height=15)
        
        # Configurar colunas
        self.tree.heading("ID", text="ID")
        self.tree.heading("N° NF", text="N° NF")
        self.tree.heading("Pedido Nectar", text="Pedido Nectar")
        self.tree.heading("Pedido Embrascol", text="Pedido Embrascol")
        self.tree.heading("Valor NF", text="Valor NF")
        self.tree.heading("Fator", text="Fator")
        self.tree.heading("Valor Comissão", text="Valor Comissão")
        self.tree.heading("Status", text="Status")
        self.tree.heading("Data", text="Data")
        
        # Largura das colunas
        self.tree.column("ID", width=50)
        self.tree.column("N° NF", width=100)
        self.tree.column("Pedido Nectar", width=120)
        self.tree.column("Pedido Embrascol", width=130)
        self.tree.column("Valor NF", width=100)
        self.tree.column("Fator", width=80)
        self.tree.column("Valor Comissão", width=120)
        self.tree.column("Status", width=100)
        self.tree.column("Data", width=100)
        
        # Scrollbar
        scrollbar = ttk.Scrollbar(table_frame, orient=tk.VERTICAL, command=self.tree.yview)
        self.tree.configure(yscrollcommand=scrollbar.set)
        
        self.tree.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        scrollbar.grid(row=0, column=1, sticky=(tk.N, tk.S))
        
        # Bind para duplo clique
        self.tree.bind("<Double-1>", self.toggle_status)
        
        # Frame dos botões
        button_frame = ttk.Frame(main_frame)
        button_frame.grid(row=3, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=(0, 10))
        
        ttk.Button(button_frame, text="Marcar como Recebida", command=self.mark_received).pack(side=tk.LEFT, padx=(0, 10))
        ttk.Button(button_frame, text="Marcar como Pendente", command=self.mark_pending).pack(side=tk.LEFT, padx=(0, 10))
        ttk.Button(button_frame, text="Editar Selecionada", command=self.edit_selected).pack(side=tk.LEFT, padx=(0, 10))
        ttk.Button(button_frame, text="Excluir Selecionada", command=self.delete_selected).pack(side=tk.LEFT, padx=(0, 10))
        
        # Frame dos relatórios
        report_frame = ttk.LabelFrame(main_frame, text="Relatórios", padding="10")
        report_frame.grid(row=4, column=0, columnspan=3, sticky=(tk.W, tk.E))
        
        ttk.Button(report_frame, text="Relatório Pendentes", command=self.show_pending_report).pack(side=tk.LEFT, padx=(0, 10))
        ttk.Button(report_frame, text="Relatório Recebidas", command=self.show_received_report).pack(side=tk.LEFT, padx=(0, 10))
        ttk.Button(report_frame, text="Relatório Completo", command=self.show_complete_report).pack(side=tk.LEFT, padx=(0, 10))
        ttk.Button(report_frame, text="Exportar CSV", command=self.export_csv).pack(side=tk.LEFT, padx=(0, 10))
        
        # Labels de totais
        self.total_label = ttk.Label(report_frame, text="", font=("Arial", 10, "bold"))
        self.total_label.pack(side=tk.RIGHT)
        
        self.update_totals()
    
    def save_commission(self):
        try:
            # Validar campos obrigatórios
            if not self.valor_nf_var.get().strip():
                messagebox.showerror("Erro", "O campo 'Valor NF' é obrigatório!")
                return
            
            valor_nf = float(self.valor_nf_var.get().replace(",", "."))
            fator = float(self.fator_var.get().replace(",", "."))
            valor_comissao = valor_nf * fator
            
            # Criar nova comissão
            commission = {
                "id": len(self.commissions) + 1,
                "nf": self.nf_var.get().strip(),
                "nectar": self.nectar_var.get().strip(),
                "embrascol": self.embrascol_var.get().strip(),
                "valor_nf": valor_nf,
                "fator": fator,
                "valor_comissao": valor_comissao,
                "status": "Pendente",
                "data": datetime.now().strftime("%d/%m/%Y")
            }
            
            self.commissions.append(commission)
            self.save_data()
            self.refresh_table()
            self.clear_form()
            self.update_totals()
            
            messagebox.showinfo("Sucesso", f"Comissão salva! Valor: R$ {valor_comissao:.2f}")
            
        except ValueError:
            messagebox.showerror("Erro", "Valores numéricos inválidos!")
    
    def clear_form(self):
        self.nf_var.set("")
        self.nectar_var.set("")
        self.embrascol_var.set("")
        self.valor_nf_var.set("")
        self.fator_var.set("0.025")
    
    def refresh_table(self):
        # Limpar tabela
        for item in self.tree.get_children():
            self.tree.delete(item)
        
        # Adicionar dados
        for commission in self.commissions:
            status_color = "red" if commission["status"] == "Pendente" else "green"
            item = self.tree.insert("", tk.END, values=(
                commission["id"],
                commission["nf"],
                commission["nectar"],
                commission["embrascol"],
                f"R$ {commission['valor_nf']:.2f}",
                f"{commission['fator']:.3f}",
                f"R$ {commission['valor_comissao']:.2f}",
                commission["status"],
                commission["data"]
            ))
            
            if commission["status"] == "Pendente":
                self.tree.set(item, "Status", commission["status"])
    
    def toggle_status(self, event):
        selected = self.tree.selection()
        if selected:
            item = selected[0]
            commission_id = int(self.tree.item(item)["values"][0])
            
            for commission in self.commissions:
                if commission["id"] == commission_id:
                    commission["status"] = "Recebida" if commission["status"] == "Pendente" else "Pendente"
                    break
            
            self.save_data()
            self.refresh_table()
            self.update_totals()
    
    def mark_received(self):
        self.change_status("Recebida")
    
    def mark_pending(self):
        self.change_status("Pendente")
    
    def change_status(self, new_status):
        selected = self.tree.selection()
        if not selected:
            messagebox.showwarning("Aviso", "Selecione uma comissão!")
            return
        
        for item in selected:
            commission_id = int(self.tree.item(item)["values"][0])
            for commission in self.commissions:
                if commission["id"] == commission_id:
                    commission["status"] = new_status
                    break
        
        self.save_data()
        self.refresh_table()
        self.update_totals()
    
    def edit_selected(self):
        selected = self.tree.selection()
        if not selected:
            messagebox.showwarning("Aviso", "Selecione uma comissão!")
            return
        
        item = selected[0]
        commission_id = int(self.tree.item(item)["values"][0])
        
        for commission in self.commissions:
            if commission["id"] == commission_id:
                self.nf_var.set(commission["nf"])
                self.nectar_var.set(commission["nectar"])
                self.embrascol_var.set(commission["embrascol"])
                self.valor_nf_var.set(str(commission["valor_nf"]))
                self.fator_var.set(str(commission["fator"]))
                
                # Remover a comissão atual para permitir edição
                self.commissions.remove(commission)
                self.save_data()
                self.refresh_table()
                self.update_totals()
                break
    
    def delete_selected(self):
        selected = self.tree.selection()
        if not selected:
            messagebox.showwarning("Aviso", "Selecione uma comissão!")
            return
        
        if messagebox.askyesno("Confirmar", "Deseja realmente excluir a(s) comissão(ões) selecionada(s)?"):
            for item in selected:
                commission_id = int(self.tree.item(item)["values"][0])
                self.commissions = [c for c in self.commissions if c["id"] != commission_id]
            
            self.save_data()
            self.refresh_table()
            self.update_totals()
    
    def show_pending_report(self):
        self.show_report("Pendente")
    
    def show_received_report(self):
        self.show_report("Recebida")
    
    def show_complete_report(self):
        self.show_report("Todas")
    
    def show_report(self, filter_status):
        if filter_status == "Todas":
            filtered_commissions = self.commissions
        else:
            filtered_commissions = [c for c in self.commissions if c["status"] == filter_status]
        
        if not filtered_commissions:
            messagebox.showinfo("Relatório", f"Nenhuma comissão {filter_status.lower()} encontrada.")
            return
        
        # Criar janela do relatório
        report_window = tk.Toplevel(self.root)
        report_window.title(f"Relatório - Comissões {filter_status}")
        report_window.geometry("800x600")
        
        # Texto do relatório
        text_widget = tk.Text(report_window, wrap=tk.WORD, padx=10, pady=10)
        scrollbar_report = ttk.Scrollbar(report_window, orient=tk.VERTICAL, command=text_widget.yview)
        text_widget.configure(yscrollcommand=scrollbar_report.set)
        
        text_widget.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        scrollbar_report.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Gerar conteúdo do relatório
        report_content = f"RELATÓRIO DE COMISSÕES - {filter_status.upper()}\n"
        report_content += f"Gerado em: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}\n"
        report_content += "=" * 80 + "\n\n"
        
        total_valor_nf = 0
        total_comissao = 0
        
        for commission in filtered_commissions:
            report_content += f"ID: {commission['id']}\n"
            report_content += f"N° NF: {commission['nf']}\n"
            report_content += f"Pedido Nectar: {commission['nectar']}\n"
            report_content += f"Pedido Embrascol: {commission['embrascol']}\n"
            report_content += f"Valor NF: R$ {commission['valor_nf']:.2f}\n"
            report_content += f"Fator: {commission['fator']:.3f}\n"
            report_content += f"Valor Comissão: R$ {commission['valor_comissao']:.2f}\n"
            report_content += f"Status: {commission['status']}\n"
            report_content += f"Data: {commission['data']}\n"
            report_content += "-" * 40 + "\n"
            
            total_valor_nf += commission['valor_nf']
            total_comissao += commission['valor_comissao']
        
        report_content += f"\nRESUMO:\n"
        report_content += f"Total de registros: {len(filtered_commissions)}\n"
        report_content += f"Valor total NF: R$ {total_valor_nf:.2f}\n"
        report_content += f"Total comissões: R$ {total_comissao:.2f}\n"
        
        text_widget.insert(tk.END, report_content)
        text_widget.config(state=tk.DISABLED)
    
    def export_csv(self):
        if not self.commissions:
            messagebox.showwarning("Aviso", "Não há dados para exportar!")
            return
        
        filename = filedialog.asksaveasfilename(
            defaultextension=".csv",
            filetypes=[("CSV files", "*.csv"), ("All files", "*.*")],
            title="Salvar relatório CSV"
        )
        
        if filename:
            try:
                with open(filename, 'w', newline='', encoding='utf-8') as csvfile:
                    fieldnames = ['ID', 'N° NF', 'Pedido Nectar', 'Pedido Embrascol', 
                                'Valor NF', 'Fator', 'Valor Comissão', 'Status', 'Data']
                    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                    
                    writer.writeheader()
                    for commission in self.commissions:
                        writer.writerow({
                            'ID': commission['id'],
                            'N° NF': commission['nf'],
                            'Pedido Nectar': commission['nectar'],
                            'Pedido Embrascol': commission['embrascol'],
                            'Valor NF': commission['valor_nf'],
                            'Fator': commission['fator'],
                            'Valor Comissão': commission['valor_comissao'],
                            'Status': commission['status'],
                            'Data': commission['data']
                        })
                
                messagebox.showinfo("Sucesso", f"Arquivo exportado: {filename}")
            except Exception as e:
                messagebox.showerror("Erro", f"Erro ao exportar arquivo: {str(e)}")
    
    def update_totals(self):
        total_pendente = sum(c['valor_comissao'] for c in self.commissions if c['status'] == 'Pendente')
        total_recebida = sum(c['valor_comissao'] for c in self.commissions if c['status'] == 'Recebida')
        total_geral = total_pendente + total_recebida
        
        self.total_label.config(text=f"Pendente: R$ {total_pendente:.2f} | Recebida: R$ {total_recebida:.2f} | Total: R$ {total_geral:.2f}")
    
    def load_data(self):
        try:
            if os.path.exists(self.data_file):
                with open(self.data_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
        except Exception as e:
            messagebox.showerror("Erro", f"Erro ao carregar dados: {str(e)}")
        return []
    
    def save_data(self):
        try:
            with open(self.data_file, 'w', encoding='utf-8') as f:
                json.dump(self.commissions, f, ensure_ascii=False, indent=2)
        except Exception as e:
            messagebox.showerror("Erro", f"Erro ao salvar dados: {str(e)}")

def main():
    root = tk.Tk()
    app = CommissionApp(root)
    root.mainloop()

if __name__ == "__main__":
    main()
import React from 'react';
import { Pencil, Trash2, Mail, Phone, Building2, User } from 'lucide-react';

export default function ClientCard({ client, onEdit, onDelete }) {
  return (
    <div className="card p-5 flex flex-col gap-4 hover:border-gold/30 hover:shadow-gold transition-all duration-200">
      {/* Avatar + Name */}
      <div className="flex items-start justify-between gap-3 overflow-hidden">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold shrink-0
            ${client.type === 'Corporate' ? 'bg-lex-info/10 text-lex-info' : 'bg-gold/10 text-gold'}`}>
            {client.type === 'Corporate' ? <Building2 size={20} /> : <User size={20} />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-lex-text truncate">{client.name}</p>
            {client.company && (
              <p className="text-xs text-lex-muted truncate">{client.company}</p>
            )}
          </div>
        </div>
        <span className={`badge border shrink-0 ${
          client.status === 'Active'
            ? 'bg-lex-success/10 text-lex-success border-lex-success/20'
            : 'bg-navy-600 text-lex-muted border-navy-500'
        }`}>
          {client.status}
        </span>
      </div>

      {/* Contact info */}
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 text-xs text-lex-muted">
          <Mail size={12} className="shrink-0" />
          <span className="truncate">{client.email}</span>
        </div>
        {client.phone && (
          <div className="flex items-center gap-2 text-xs text-lex-muted">
            <Phone size={12} className="shrink-0" />
            <span>{client.phone}</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center justify-between pt-2 border-t border-navy-600">
        <div className="text-xs">
          <span className="text-gold font-bold">{client.activeCases ?? 0}</span>
          <span className="text-lex-muted ml-1">active cases</span>
        </div>
        <span className="badge border bg-navy-700 text-lex-muted border-navy-600 text-xs">
          {client.type}
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2 mt-1">
        <button onClick={() => onEdit(client)} className="btn-ghost flex-1 text-xs py-1.5 justify-center">
          <Pencil size={13} /> Edit
        </button>
        <button onClick={() => onDelete(client)} className="btn-danger flex-1 text-xs py-1.5 justify-center">
          <Trash2 size={13} /> Delete
        </button>
      </div>
    </div>
  );
}

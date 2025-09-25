import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Phone, Mail, Truck } from 'lucide-react';
import CreateLivreur from './CreateLivreur';
import { toast } from 'sonner';
import { useApiClient } from '../../lib/useApiClient';
import { API_URL } from '../../lib/db';

interface DeliveryPerson {
  id: string;
  prenom: string;
  phone: string;
  email: string;
  status: string;
}

interface DeliveryTabProps {
  merchantId: string;
  isPremium: boolean;
}

const DeliveryTab: React.FC<DeliveryTabProps> = ({
  merchantId,
  isPremium
}) => {
  const { fetchJSON, loading } = useApiClient();
  const [deliveryPeople, setDeliveryPeople] = useState<DeliveryPerson[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les livreurs au montage du composant
  useEffect(() => {
    loadDeliveryPeople();
  }, [merchantId]);

  const loadDeliveryPeople = async () => {
    setIsLoading(true);
    try {
      const result = await fetchJSON(`${API_URL}/getAlllivreursByCommercants`, {
        onSuccess: (data) => {
          console.log('Livreurs chargés:', data);
          
          // Ajouter Paps comme livreur par défaut s'il n'existe pas déjà
          const deliveryPeopleList = data.livreurs || data || [];
          const papsExists = deliveryPeopleList.some(dp => dp.id === 'paps_default');
          
          if (!papsExists) {
            deliveryPeopleList.unshift({
              id: 'paps_default',
              name: 'Paps (Service de livraison)',
              phone: '+221 33 XXX XX XX',
              email: 'support@paps.sn',
              status: 'online'
            });
          }
          
          setDeliveryPeople(deliveryPeopleList);
        },
        onError: (error) => {
          console.error('Erreur lors du chargement des livreurs:', error);
          toast.error('Erreur lors du chargement des livreurs');
          
          // En cas d'erreur, au moins ajouter Paps par défaut
          setDeliveryPeople([{
            id: 'paps_default',
            name: 'Paps (Service de livraison)',
            phone: '+221 33 XXX XX XX',
            email: 'support@paps.sn',
            status: 'online'
          }]);
        }
      });
    } catch (error) {
      console.error('Erreur lors du chargement des livreurs:', error);
      toast.error('Erreur lors du chargement des livreurs');
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour recharger la liste après création d'un nouveau livreur
  const handleLivreurCreated = (data) => {
    // Ajouter le nouveau livreur à la liste
    if (data.user) {
      setDeliveryPeople(prev => [...prev, {
        id: data.user._id || data.user.id,
        name: `${data.user.prenom} ${data.user.nom}`,
        phone: data.user.telephone,
        email: data.user.email,
        status: 'offline' // Nouveau livreur commence hors ligne
      }]);
    }
    toast.success('Livreur créé avec succès !');
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl">Gestion des livreurs</h2>
          </div>
        </div>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
          <span>Chargement des livreurs...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl">Gestion des livreurs</h2>
          {!isPremium && (
            <p className="text-sm text-gray-600 mt-1">
              Version freemium : 1 livreur personnalisé + Paps inclus
            </p>
          )}
          <p className="text-sm text-blue-600 mt-1">
            {deliveryPeople.length} livreur(s) disponible(s)
          </p>
        </div>

        <CreateLivreur 
          commercantId={merchantId}
          onSuccess={handleLivreurCreated}
          disabled={loading}
          maxReached={!isPremium && deliveryPeople.filter(dp => dp.id !== 'paps_default').length >= 1}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {deliveryPeople.map((deliveryPerson) => (
          <Card 
            key={deliveryPerson.id} 
            className={deliveryPerson.id === 'paps_default' ? 'border-blue-200 bg-blue-50' : 'bg-white/80 dark:bg-gray-800/60 backdrop-blur'}
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <h3 className="text-lg">{deliveryPerson.prenom}</h3>
                  {deliveryPerson.id === 'paps_default' && (
                    <Badge className="ml-2 bg-blue-600">
                      <Truck className="w-3 h-3 mr-1" />
                      Partenaire
                    </Badge>
                  )}
                </div>
                <Badge variant={deliveryPerson.status === 'online' ? "default" : "secondary"}>
                  {deliveryPerson.status === 'online' ? 'En ligne' : 'Hors ligne'}
                </Badge>
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <p className="flex items-center"><Phone className="w-4 h-4 mr-2" />{deliveryPerson.phone}</p>
                {deliveryPerson.email && (
                  <p className="flex items-center"><Mail className="w-4 h-4 mr-2" />{deliveryPerson.email}</p>
                )}
              </div>
              {deliveryPerson.id === 'paps_default' && (
                <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-800">
                  ✓ Service de livraison professionnel
                  <br />✓ Couverture étendue
                  <br />✓ Suivi en temps réel
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {deliveryPeople.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">Aucun livreur trouvé</p>
          <p className="text-sm text-gray-400">
            Créez votre premier livreur pour commencer à gérer vos livraisons
          </p>
        </div>
      )}
    </div>
  );
};

export default DeliveryTab;
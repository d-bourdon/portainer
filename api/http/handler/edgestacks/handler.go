package edgestacks

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/gorilla/mux"
	httperror "github.com/portainer/libhttp/error"
	portainer "github.com/portainer/portainer/api"
	"github.com/portainer/portainer/api/dataservices"
	"github.com/portainer/portainer/api/filesystem"
	"github.com/portainer/portainer/api/http/middlewares"
	"github.com/portainer/portainer/api/http/security"
)

// Handler is the HTTP handler used to handle environment(endpoint) group operations.
type Handler struct {
	*mux.Router
	requestBouncer     *security.RequestBouncer
	DataStore          dataservices.DataStore
	FileService        portainer.FileService
	GitService         portainer.GitService
	KubernetesDeployer portainer.KubernetesDeployer
	Endpoint           *portainer.Endpoint
}

// NewHandler creates a handler to manage environment(endpoint) group operations.
func NewHandler(bouncer *security.RequestBouncer, dataStore dataservices.DataStore) *Handler {
	h := &Handler{
		Router:         mux.NewRouter(),
		requestBouncer: bouncer,
		DataStore:      dataStore,
	}
	h.Handle("/edge_stacks",
		bouncer.AdminAccess(bouncer.EdgeComputeOperation(httperror.LoggerHandler(h.edgeStackCreate)))).Methods(http.MethodPost)
	h.Handle("/edge_stacks",
		bouncer.AdminAccess(bouncer.EdgeComputeOperation(httperror.LoggerHandler(h.edgeStackList)))).Methods(http.MethodGet)
	h.Handle("/edge_stacks/{id}",
		bouncer.AdminAccess(bouncer.EdgeComputeOperation(httperror.LoggerHandler(h.edgeStackInspect)))).Methods(http.MethodGet)
	h.Handle("/edge_stacks/{id}",
		bouncer.AdminAccess(bouncer.EdgeComputeOperation(httperror.LoggerHandler(h.edgeStackUpdate)))).Methods(http.MethodPut)
	h.Handle("/edge_stacks/{id}",
		bouncer.AdminAccess(bouncer.EdgeComputeOperation(httperror.LoggerHandler(h.edgeStackDelete)))).Methods(http.MethodDelete)
	h.Handle("/edge_stacks/{id}/file",
		bouncer.AdminAccess(bouncer.EdgeComputeOperation(httperror.LoggerHandler(h.edgeStackFile)))).Methods(http.MethodGet)
	h.Handle("/edge_stacks/{id}/status",
		bouncer.PublicAccess(httperror.LoggerHandler(h.edgeStackStatusUpdate))).Methods(http.MethodPut)

	edgeStackStatusRouter := h.NewRoute().Subrouter()
	edgeStackStatusRouter.Use(middlewares.WithEndpoint(h.DataStore.Endpoint(), "endpoint_id"))

	edgeStackStatusRouter.PathPrefix("/edge_stacks/{id}/status/{endpoint_id}").Handler(bouncer.PublicAccess(httperror.LoggerHandler(h.edgeStackStatusDelete))).Methods(http.MethodDelete)

	return h
}

func (handler *Handler) convertAndStoreKubeManifestIfNeeded(edgeStack *portainer.EdgeStack, relatedEndpointIds []portainer.EndpointID) error {
	hasKubeEndpoint, err := hasKubeEndpoint(handler.DataStore.Endpoint(), relatedEndpointIds)
	if err != nil {
		return fmt.Errorf("unable to check if edge stack has kube environments: %w", err)
	}

	if !hasKubeEndpoint {
		return nil
	}

	composeConfig, err := handler.FileService.GetFileContent(edgeStack.ProjectPath, edgeStack.EntryPoint)
	if err != nil {
		return fmt.Errorf("unable to retrieve Compose file from disk: %w", err)
	}

	kompose, err := handler.KubernetesDeployer.ConvertCompose(composeConfig)
	if err != nil {
		return fmt.Errorf("failed converting compose file to kubernetes manifest: %w", err)
	}

	komposeFileName := filesystem.ManifestFileDefaultName
	_, err = handler.FileService.StoreEdgeStackFileFromBytes(strconv.Itoa(int(edgeStack.ID)), komposeFileName, kompose)
	if err != nil {
		return fmt.Errorf("failed to store kube manifest file: %w", err)
	}

	edgeStack.ManifestPath = komposeFileName

	return nil
}

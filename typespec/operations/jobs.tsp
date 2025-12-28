using TypeSpec.Http;
using TypeSpec.Rest;

namespace DarkPearl.Operations;

@route("/jobs")
@tag("Jobs")
interface Jobs {
  @doc("List all jobs with optional filters")
  @get
  list(
    @query lawn_id?: string,
    @query customer_id?: string,
    @query operator_id?: string,
    @query scheduled_date?: plainDate,
    @query date_from?: plainDate,
    @query date_to?: plainDate,
    @query status?: Models.JobStatus,
    @query limit?: int32 = 100,
    @query offset?: int32 = 0,
  ): Models.JobListResponse;

  @doc("Get a job by ID with treatments")
  @get
  @route("{id}")
  get(@path id: string): Models.JobWithDetails | Models.ErrorResponse;

  @doc("Create a new job")
  @post
  create(@body request: Models.CreateJobRequest): {
    @statusCode statusCode: 201;
    @body body: Models.Job;
  } | Models.ErrorResponse;

  @doc("Update an existing job")
  @put
  @route("{id}")
  update(
    @path id: string,
    @body request: Models.UpdateJobRequest,
  ): Models.Job | Models.ErrorResponse;

  @doc("Delete a job")
  @delete
  @route("{id}")
  delete(@path id: string): {
    message: string;
  } | Models.ErrorResponse;

  @doc("Add treatment to job")
  @post
  @route("{id}/treatments")
  addTreatment(
    @path id: string,
    @body request: Models.CreateJobTreatmentRequest,
  ): {
    @statusCode statusCode: 201;
    @body body: Models.JobTreatment;
  } | Models.ErrorResponse;

  @doc("Record product consumption")
  @post
  @route("{id}/consumptions")
  addConsumption(
    @path id: string,
    @body request: Models.CreateJobConsumptionRequest,
  ): {
    @statusCode statusCode: 201;
    @body body: Models.JobConsumption;
  } | Models.ErrorResponse;

  @doc("Start job execution")
  @post
  @route("{id}/start")
  start(@path id: string): Models.Job | Models.ErrorResponse;

  @doc("Complete job execution")
  @post
  @route("{id}/complete")
  complete(@path id: string): Models.Job | Models.ErrorResponse;

  @doc("Skip job")
  @post
  @route("{id}/skip")
  skip(
    @path id: string,
    @body request: { reason?: string },
  ): Models.Job | Models.ErrorResponse;
}
